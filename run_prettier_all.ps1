[CmdletBinding()]
param(
  [switch]$CheckOnly,
  [switch]$SkipBackup
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
Set-Location -Path $repoRoot

if ($CheckOnly -and $SkipBackup) {
  Write-Error "-SkipBackup cannot be used with -CheckOnly."
  exit 2
}

$requiredPaths = @(
  "networklayer/markers.js",
  "networklayer/index.html"
)
foreach ($path in $requiredPaths) {
  if (-not (Test-Path -Path $path)) {
    Write-Error "Run this script from the project root. Missing: $path"
    exit 2
  }
}

foreach ($cmd in @("rg", "npx.cmd")) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Error "Required command not found: $cmd"
    exit 2
  }
}

if (-not (Test-Path -Path ".prettierrc.json")) {
  Write-Error "Missing .prettierrc.json in project root."
  exit 2
}

$opsDir = Join-Path $repoRoot "_ops"
New-Item -ItemType Directory -Path $opsDir -Force | Out-Null

if (-not $CheckOnly -and -not $SkipBackup) {
  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $parentPath = (Resolve-Path "..").Path
  $backupPath = Join-Path $parentPath "concept-markers-backup-$timestamp.zip"
  Compress-Archive -Path (Join-Path $repoRoot "*") -DestinationPath $backupPath -Force
  Write-Host "Backup created: $backupPath"
}

$allFiles = & rg --files -uu
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to collect file list with rg."
  exit 3
}

$targetFiles = $allFiles |
  Where-Object { $_ -imatch '\.(html|js|json)$' } |
  Sort-Object -Unique

if (-not $targetFiles -or $targetFiles.Count -eq 0) {
  Write-Error "No target files found (.html/.js/.json)."
  exit 3
}

$filesListPath = Join-Path $opsDir "prettier-files.txt"
$countPath = Join-Path $opsDir "prettier-count.txt"
$writeLogPath = Join-Path $opsDir "prettier-write.log"
$checkLogPath = Join-Path $opsDir "prettier-check.log"
$diffPath = Join-Path $opsDir "prettier-diff.txt"

Set-Content -Path $filesListPath -Value $targetFiles -Encoding utf8
Set-Content -Path $countPath -Value $targetFiles.Count -Encoding utf8

Write-Host "Targets: $($targetFiles.Count) files"

function Invoke-PrettierBatched {
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("write", "check")]
    [string]$Mode,
    [Parameter(Mandatory = $true)]
    [string[]]$Files,
    [Parameter(Mandatory = $true)]
    [string]$LogPath,
    [int]$BatchSize = 25
  )

  if (Test-Path -Path $LogPath) {
    Remove-Item -Path $LogPath -Force
  }

  $overallExitCode = 0

  for ($i = 0; $i -lt $Files.Count; $i += $BatchSize) {
    $end = [Math]::Min($i + $BatchSize - 1, $Files.Count - 1)
    $batch = $Files[$i..$end]

    $args = @("prettier")
    if ($Mode -eq "write") {
      $args += "--write"
    }
    else {
      $args += "--check"
    }
    $args += @("--ignore-unknown", "--config", ".\.prettierrc.json")
    $args += $batch

    $output = & npx.cmd @args 2>&1
    $exitCode = $LASTEXITCODE

    Add-Content -Path $LogPath -Value "=== mode:$Mode batch:$i-$end ===" -Encoding utf8
    if ($output) {
      $output | ForEach-Object { $_.ToString() } | Add-Content -Path $LogPath -Encoding utf8
    }
    Add-Content -Path $LogPath -Value "" -Encoding utf8

    if ($exitCode -ne 0 -and $overallExitCode -eq 0) {
      $overallExitCode = $exitCode
    }

    if ($Mode -eq "write" -and $exitCode -ne 0) {
      Write-Error "Prettier write failed on batch $i-$end."
      exit $exitCode
    }
  }

  return $overallExitCode
}

function Write-PrettierDiffReport {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Files,
    [Parameter(Mandatory = $true)]
    [string]$DiffFilePath,
    [int]$BatchSize = 25
  )

  if (Test-Path -Path $DiffFilePath) {
    Remove-Item -Path $DiffFilePath -Force
  }
  New-Item -ItemType File -Path $DiffFilePath -Force | Out-Null

  $overallExitCode = 0

  for ($i = 0; $i -lt $Files.Count; $i += $BatchSize) {
    $end = [Math]::Min($i + $BatchSize - 1, $Files.Count - 1)
    $batch = $Files[$i..$end]

    $args = @(
      "prettier",
      "--list-different",
      "--ignore-unknown",
      "--config",
      ".\.prettierrc.json"
    )
    $args += $batch

    $output = & npx.cmd @args 2>&1
    $exitCode = $LASTEXITCODE

    if ($output) {
      $output | ForEach-Object { $_.ToString() } | Add-Content -Path $DiffFilePath -Encoding utf8
    }

    if ($exitCode -ne 0 -and $overallExitCode -eq 0) {
      $overallExitCode = $exitCode
    }
  }

  return $overallExitCode
}

if (-not $CheckOnly) {
  [void](Invoke-PrettierBatched -Mode "write" -Files $targetFiles -LogPath $writeLogPath)
}
else {
  if (Test-Path -Path $writeLogPath) {
    Remove-Item -Path $writeLogPath -Force
  }
  Set-Content -Path $writeLogPath -Value "Skipped in -CheckOnly mode." -Encoding utf8
}

$checkExitCode = Invoke-PrettierBatched -Mode "check" -Files $targetFiles -LogPath $checkLogPath
[void](Write-PrettierDiffReport -Files $targetFiles -DiffFilePath $diffPath)

if ($checkExitCode -eq 0) {
  Write-Host "Prettier check passed."
  exit 0
}

Write-Error "Prettier check failed. See:"
Write-Error "  $checkLogPath"
Write-Error "  $diffPath"
exit $checkExitCode
