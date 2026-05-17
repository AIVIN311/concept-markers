param(
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

function Invoke-CfApi {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [object]$Body = $null
  )

  $headers = @{
    Authorization = "Bearer $env:CLOUDFLARE_API_TOKEN"
  }

  try {
    if ($null -ne $Body) {
      $headers["Content-Type"] = "application/json"
      return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 6)
    }

    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers
  } catch {
    $response = $_.Exception.Response
    if ($response -and $response.GetResponseStream()) {
      $reader = [System.IO.StreamReader]::new($response.GetResponseStream())
      $details = $reader.ReadToEnd()
      if ($details) {
        throw "$($_.Exception.Message) $details"
      }
    }

    throw
  }
}

$token = ($env:CLOUDFLARE_API_TOKEN -replace "`r|`n", "").Trim()
if (-not $token -or $token -eq "貼上你的新 token" -or $token -notmatch "^cf[a-zA-Z0-9_\\-]+") {
  throw "CLOUDFLARE_API_TOKEN is missing or still contains the placeholder. Set it in this PowerShell session first."
}
$env:CLOUDFLARE_API_TOKEN = $token

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$domainsPayload = Get-Content (Join-Path $root "domains.json") -Raw | ConvertFrom-Json
$domains = $domainsPayload.domains

New-Item -ItemType Directory -Force (Join-Path $root "_ops") | Out-Null
$mode = if ($CheckOnly) { "check" } else { "enable" }
$logPath = Join-Path $root "_ops\cloudflare-markdown-for-agents-$mode-results.jsonl"
Remove-Item $logPath -ErrorAction SilentlyContinue

$results = @()

foreach ($domain in $domains) {
  $hostName = [string]$domain.host
  Write-Host "$mode Markdown for Agents: $hostName"

  try {
    $zoneResponse = Invoke-CfApi -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$hostName"
    $zone = $zoneResponse.result | Select-Object -First 1

    if (-not $zone) {
      $row = [pscustomobject]@{
        host = $hostName
        success = $false
        skipped = $true
        reason = "zone not found"
      }
    } else {
      $settingUri = "https://api.cloudflare.com/client/v4/zones/$($zone.id)/settings/content_converter"
      $currentSetting = Invoke-CfApi -Method Get -Uri $settingUri

      if ($CheckOnly -or [bool]$currentSetting.result.editable -eq $false) {
        $settingResponse = $currentSetting
      } else {
        $settingResponse = Invoke-CfApi -Method Patch -Uri $settingUri -Body @{ value = "on" }
      }

      $row = [pscustomobject]@{
        host = $hostName
        zone_id = $zone.id
        success = [bool]$settingResponse.success -and ($CheckOnly -or $settingResponse.result.value -eq "on")
        skipped = (-not $CheckOnly) -and [bool]$currentSetting.result.editable -eq $false
        reason = if ((-not $CheckOnly) -and [bool]$currentSetting.result.editable -eq $false) { "content_converter setting is not editable for this zone" } else { $null }
        value = $settingResponse.result.value
        editable = $settingResponse.result.editable
        modified_on = $settingResponse.result.modified_on
        errors = $settingResponse.errors
      }
    }
  } catch {
    $row = [pscustomobject]@{
      host = $hostName
      success = $false
      error = $_.Exception.Message
    }
  }

  $row | ConvertTo-Json -Compress -Depth 8 | Add-Content -Path $logPath -Encoding utf8
  $results += $row
}

$failed = @($results | Where-Object { $_.success -ne $true })
$onCount = @($results | Where-Object { $_.value -eq "on" }).Count

Write-Host "Markdown for Agents $mode complete: $onCount/$($results.Count) on, $($failed.Count) failed or skipped."
Write-Host "Log: $logPath"

if ($failed.Count -gt 0) {
  $failed | Select-Object host, success, skipped, reason, error, errors | Format-List
  throw "One or more Markdown for Agents operations failed. You may need Zone > Zone Settings > Edit, or a Pro/Business/Enterprise zone."
}
