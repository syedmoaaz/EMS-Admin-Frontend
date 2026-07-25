#Requires -RunAsAdministrator
<#
  Install EMS Branch Agent as a Windows Service (auto-start, restart on failure).
  Uses NSSM if available on PATH, otherwise downloads a portable nssm.exe into .\tools\

  Usage:
    .\scripts\install-service.ps1 -ExePath "C:\Program Files\EMS Branch Agent\EMS Branch Agent.exe"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$ExePath
)

$ServiceName = "EMSBranchAgent"
$DisplayName = "EMS Branch Agent"
$ExePath = (Resolve-Path $ExePath).Path

if (-not (Test-Path $ExePath)) {
  Write-Error "EXE not found: $ExePath"
  exit 1
}

$toolsDir = Join-Path $PSScriptRoot "..\tools"
New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
$nssm = Join-Path $toolsDir "nssm.exe"

function Get-Nssm {
  if (Get-Command nssm -ErrorAction SilentlyContinue) {
    return (Get-Command nssm).Source
  }
  if (Test-Path $nssm) { return $nssm }

  Write-Host "Downloading NSSM (service wrapper)..."
  $zip = Join-Path $toolsDir "nssm.zip"
  $url = "https://nssm.cc/release/nssm-2.24.zip"
  Invoke-WebRequest -Uri $url -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath (Join-Path $toolsDir "nssm-extract") -Force
  $found = Get-ChildItem -Path (Join-Path $toolsDir "nssm-extract") -Recurse -Filter nssm.exe |
    Where-Object { $_.FullName -match "win64" } |
    Select-Object -First 1
  if (-not $found) {
    Write-Error "Could not find nssm.exe in download"
    exit 1
  }
  Copy-Item $found.FullName $nssm -Force
  return $nssm
}

$nssmPath = Get-Nssm

# Stop/remove existing
& $nssmPath stop $ServiceName 2>$null | Out-Null
& $nssmPath remove $ServiceName confirm 2>$null | Out-Null

& $nssmPath install $ServiceName $ExePath --headless
& $nssmPath set $ServiceName DisplayName $DisplayName
& $nssmPath set $ServiceName Description "Pulls ZKTeco K50 punches and uploads to EMS"
& $nssmPath set $ServiceName Start SERVICE_AUTO_START
& $nssmPath set $ServiceName AppDirectory (Split-Path $ExePath -Parent)
& $nssmPath set $ServiceName AppRestartDelay 5000
& $nssmPath set $ServiceName AppStdout (Join-Path $env:USERPROFILE ".ems-branch-agent\logs\service-out.log")
& $nssmPath set $ServiceName AppStderr (Join-Path $env:USERPROFILE ".ems-branch-agent\logs\service-err.log")
New-Item -ItemType Directory -Force -Path (Join-Path $env:USERPROFILE ".ems-branch-agent\logs") | Out-Null

& $nssmPath start $ServiceName

Write-Host "OK: Windows Service '$ServiceName' installed and started."
Write-Host "Runs headless with --headless. Configure via tray EXE or:"
Write-Host "  $env:USERPROFILE\.ems-branch-agent\config.json"
Write-Host "Manage: services.msc → $DisplayName"
