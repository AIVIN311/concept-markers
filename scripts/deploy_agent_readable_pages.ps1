param(
  [string]$CommitHash = "",
  [string]$CommitMessage = "Deploy agent-readable artifacts",
  [switch]$SkipPurge
)

$ErrorActionPreference = "Stop"

function Get-ProjectName {
  param([string]$DomainHost)

  if ($DomainHost.EndsWith(".com")) {
    return $DomainHost.Substring(0, $DomainHost.Length - 4).ToLowerInvariant()
  }

  return ($DomainHost -replace "\.", "").ToLowerInvariant()
}

function Invoke-CfApi {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [object]$Body = $null
  )

  $headers = @{
    Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN"
  }

  if ($null -ne $Body) {
    $headers["Content-Type"] = "application/json"
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 6)
  }

  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers
}

$token = ($env:CLOUDFLARE_API_TOKEN -replace "`r|`n", "").Trim()
if (-not $token -or $token -eq "貼上你的新 token" -or $token -notmatch "^cf[a-zA-Z0-9_\\-]+") {
  throw "CLOUDFLARE_API_TOKEN is missing or still contains the placeholder. Set it in this PowerShell session first."
}
$env:CLOUDFLARE_API_TOKEN = $token

if (-not $CommitHash) {
  $CommitHash = (git rev-parse --short HEAD).Trim()
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$domainsPayload = Get-Content (Join-Path $root "domains.json") -Raw | ConvertFrom-Json
$domains = $domainsPayload.domains

New-Item -ItemType Directory -Force (Join-Path $root "_ops") | Out-Null
$deployLog = Join-Path $root "_ops\agent-readable-deploy-results.jsonl"
$purgeLog = Join-Path $root "_ops\agent-readable-purge-results.jsonl"
Remove-Item $deployLog, $purgeLog -ErrorAction SilentlyContinue

$deployResults = @()

foreach ($domain in $domains) {
  $hostName = [string]$domain.host
  $folder = [string]$domain.folder
  $project = Get-ProjectName -DomainHost $hostName

  Write-Host "Deploying $hostName -> $project from $folder"
  $started = Get-Date -Format o
  $output = & npx wrangler pages deploy $folder --project-name $project --branch main --commit-dirty=false --commit-hash $CommitHash --commit-message $CommitMessage 2>&1
  $exit = $LASTEXITCODE
  $deploymentUrl = ($output | Select-String -Pattern "https://[^\s]+\.pages\.dev" | Select-Object -Last 1).Matches.Value

  $row = [pscustomobject]@{
    host = $hostName
    folder = $folder
    project = $project
    exit_code = $exit
    deployment_url = $deploymentUrl
    started_at = $started
    ended_at = (Get-Date -Format o)
    output_tail = (($output | Select-Object -Last 8) -join "`n")
  }

  $row | ConvertTo-Json -Compress | Add-Content -Path $deployLog -Encoding utf8
  $deployResults += $row
}

$failedDeploys = $deployResults | Where-Object { $_.exit_code -ne 0 }
Write-Host "Deploy complete: $($deployResults.Count - $failedDeploys.Count)/$($deployResults.Count) succeeded."

if ($failedDeploys.Count -gt 0) {
  $failedDeploys | Select-Object host, project, exit_code, output_tail | Format-List
  throw "One or more Pages deployments failed. See $deployLog"
}

if (-not $SkipPurge) {
  foreach ($domain in $domains) {
    $hostName = [string]$domain.host
    Write-Host "Purging cache for $hostName"

    try {
      $zoneResponse = Invoke-CfApi -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$hostName"
      $zone = $zoneResponse.result | Select-Object -First 1

      if (-not $zone) {
        [pscustomobject]@{
          host = $hostName
          success = $false
          skipped = $true
          reason = "zone not found"
        } | ConvertTo-Json -Compress | Add-Content -Path $purgeLog -Encoding utf8
        continue
      }

      $files = @("https://$hostName/", "https://$hostName/index.md")
      $purgeResponse = Invoke-CfApi -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$($zone.id)/purge_cache" -Body @{ files = $files }

      [pscustomobject]@{
        host = $hostName
        zone_id = $zone.id
        success = [bool]$purgeResponse.success
        files = $files
        errors = $purgeResponse.errors
      } | ConvertTo-Json -Compress -Depth 8 | Add-Content -Path $purgeLog -Encoding utf8
    } catch {
      [pscustomobject]@{
        host = $hostName
        success = $false
        error = $_.Exception.Message
      } | ConvertTo-Json -Compress | Add-Content -Path $purgeLog -Encoding utf8
    }
  }
}

Write-Host "Logs:"
Write-Host "- $deployLog"
if (-not $SkipPurge) {
  Write-Host "- $purgeLog"
}
