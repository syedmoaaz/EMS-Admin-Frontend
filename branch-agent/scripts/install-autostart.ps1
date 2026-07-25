#Requires -RunAsAdministrator
<#
  Install EMS Branch Agent to start at Windows boot (Scheduled Task).
  Usage (from elevated PowerShell):
    .\scripts\install-autostart.ps1 -ExePath "C:\Program Files\EMS Branch Agent\EMS Branch Agent.exe"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$ExePath
)

$TaskName = "EMS-Branch-Agent"
$ExePath = (Resolve-Path $ExePath).Path

if (-not (Test-Path $ExePath)) {
  Write-Error "EXE not found: $ExePath"
  exit 1
}

# Remove old task if present
schtasks /Delete /TN $TaskName /F 2>$null | Out-Null

# Run at logon for the current user (has network + desktop session for LAN)
$User = "$env:USERDOMAIN\$env:USERNAME"
schtasks /Create /TN $TaskName /TR "`"$ExePath`"" /SC ONLOGON /RL HIGHEST /RU $User /F

if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to create scheduled task"
  exit $LASTEXITCODE
}

Write-Host "OK: Task '$TaskName' will start the agent at logon."
Write-Host "EXE: $ExePath"
Write-Host "Config stays in: $env:USERPROFILE\.ems-branch-agent\config.json"
