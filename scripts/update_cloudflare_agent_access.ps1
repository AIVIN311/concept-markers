param(
  [switch]$CheckOnly,
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if ($CheckOnly -and $Apply) {
  throw "Use either -CheckOnly or -Apply, not both."
}

if (-not $CheckOnly -and -not $Apply) {
  $CheckOnly = $true
}

$targetDescription = "CivRadar: managed challenge generic non-browser clients"
$oldExpression = '(http.user_agent eq "" or lower(http.user_agent) contains "curl/")'
$newExpression = '(http.user_agent eq "" or lower(http.user_agent) contains "curl/") and not http.request.uri.path in {"/" "/index.md" "/robots.txt" "/sitemap.xml"}'
$publicPaths = @("/", "/index.md", "/robots.txt", "/sitemap.xml")

function Test-PublicPathsAreExempted {
  param(
    [Parameter(Mandatory = $true)][string]$Expression
  )

  $hasBaseUserAgentMatch =
    $Expression -match 'http\.user_agent\s+eq\s+""' -and
    $Expression -match 'lower\(http\.user_agent\)\s+contains\s+"curl/"'
  $hasNotClause = $Expression -match '\bnot\b'
  $hasAllPublicPaths = $true

  foreach ($publicPath in $publicPaths) {
    if ($Expression -notlike "*`"$publicPath`"*") {
      $hasAllPublicPaths = $false
      break
    }
  }

  return $hasBaseUserAgentMatch -and $hasNotClause -and $hasAllPublicPaths
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

  try {
    if ($null -ne $Body) {
      $headers["Content-Type"] = "application/json"
      return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $headers -Body ($Body | ConvertTo-Json -Depth 20)
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
if (-not $token -or $token -eq "貼上你的新 token" -or $token -notmatch "^cf[a-zA-Z0-9_\-]+") {
  throw "CLOUDFLARE_API_TOKEN is missing or still contains the placeholder. Set it in this PowerShell session first."
}
$env:CLOUDFLARE_API_TOKEN = $token

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$domainsPayload = Get-Content (Join-Path $root "domains.json") -Raw | ConvertFrom-Json
$domains = $domainsPayload.domains

New-Item -ItemType Directory -Force (Join-Path $root "_ops") | Out-Null
$mode = if ($Apply) { "apply" } else { "check" }
$logPath = Join-Path $root "_ops\cloudflare-agent-access-$mode-results.jsonl"
Remove-Item $logPath -ErrorAction SilentlyContinue

$results = @()

foreach ($domain in $domains) {
  $hostName = [string]$domain.host
  Write-Host "$mode agent access rule: $hostName"

  try {
    $zoneResponse = Invoke-CfApi -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$hostName"
    $zone = $zoneResponse.result | Select-Object -First 1

    if (-not $zone) {
      $row = [pscustomobject]@{
        host = $hostName
        success = $false
        status = "zone_not_found"
      }
    } else {
      $entrypointUri = "https://api.cloudflare.com/client/v4/zones/$($zone.id)/rulesets/phases/http_request_firewall_custom/entrypoint"
      $rulesetResponse = Invoke-CfApi -Method Get -Uri $entrypointUri
      $ruleset = $rulesetResponse.result
      $rule = $ruleset.rules | Where-Object { $_.description -eq $targetDescription } | Select-Object -First 1

      if (-not $rule) {
        $row = [pscustomobject]@{
          host = $hostName
          zone_id = $zone.id
          ruleset_id = $ruleset.id
          success = $false
          status = "target_rule_not_found"
        }
      } elseif ($rule.expression -eq $newExpression -or (Test-PublicPathsAreExempted -Expression $rule.expression)) {
        $row = [pscustomobject]@{
          host = $hostName
          zone_id = $zone.id
          ruleset_id = $ruleset.id
          rule_id = $rule.id
          success = $true
          status = if ($rule.expression -eq $newExpression) { "already_updated" } else { "already_public_paths_exempted" }
          old_expression = $rule.expression
          new_expression = $newExpression
        }
      } elseif ($rule.expression -ne $oldExpression) {
        $row = [pscustomobject]@{
          host = $hostName
          zone_id = $zone.id
          ruleset_id = $ruleset.id
          rule_id = $rule.id
          success = $false
          status = "unexpected_expression"
          old_expression = $rule.expression
          new_expression = $newExpression
        }
      } elseif ($CheckOnly) {
        $row = [pscustomobject]@{
          host = $hostName
          zone_id = $zone.id
          ruleset_id = $ruleset.id
          rule_id = $rule.id
          success = $true
          status = "would_update"
          old_expression = $rule.expression
          new_expression = $newExpression
        }
      } else {
        $rule.expression = $newExpression

        $body = @{
          name = $ruleset.name
          description = $ruleset.description
          kind = $ruleset.kind
          phase = $ruleset.phase
          rules = $ruleset.rules
        }

        $updateUri = "https://api.cloudflare.com/client/v4/zones/$($zone.id)/rulesets/$($ruleset.id)"
        $updateResponse = Invoke-CfApi -Method Put -Uri $updateUri -Body $body
        $updatedRule = $updateResponse.result.rules | Where-Object { $_.description -eq $targetDescription } | Select-Object -First 1

        $row = [pscustomobject]@{
          host = $hostName
          zone_id = $zone.id
          ruleset_id = $ruleset.id
          rule_id = $rule.id
          success = [bool]$updateResponse.success -and $updatedRule.expression -eq $newExpression
          status = if ([bool]$updateResponse.success -and $updatedRule.expression -eq $newExpression) { "updated" } else { "update_failed" }
          old_expression = $oldExpression
          new_expression = $newExpression
          errors = $updateResponse.errors
        }
      }
    }
  } catch {
    $row = [pscustomobject]@{
      host = $hostName
      success = $false
      status = "error"
      error = $_.Exception.Message
    }
  }

  $row | ConvertTo-Json -Compress -Depth 10 | Add-Content -Path $logPath -Encoding utf8
  $results += $row
}

$failed = @($results | Where-Object { $_.success -ne $true })
$wouldUpdate = @($results | Where-Object { $_.status -eq "would_update" }).Count
$updated = @($results | Where-Object { $_.status -eq "updated" }).Count
$alreadyUpdated = @($results | Where-Object { $_.status -eq "already_updated" }).Count
$alreadyPublicPathsExempted = @($results | Where-Object { $_.status -eq "already_public_paths_exempted" }).Count

Write-Host "Cloudflare agent access $mode complete: $($results.Count - $failed.Count)/$($results.Count) successful."
Write-Host "Would update: $wouldUpdate; Updated: $updated; Already updated: $alreadyUpdated; Already public-paths exempted: $alreadyPublicPathsExempted."
Write-Host "Log: $logPath"

if ($failed.Count -gt 0) {
  $failed | Select-Object host, status, old_expression, error | Format-List
  throw "One or more Cloudflare agent access operations failed. See $logPath"
}
