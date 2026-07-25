#Requires -RunAsAdministrator
param()

$ServiceName = "EMSBranchAgent"
$TaskName = "EMS-Branch-Agent"

$nssm = Join-Path $PSScriptRoot "..\tools\nssm.exe"
if (Test-Path $nssm) {
  & $nssm stop $ServiceName 2>$null | Out-Null
  & $nssm remove $ServiceName confirm 2>$null | Out-Null
} else {
  sc.exe stop $ServiceName 2>$null | Out-Null
  sc.exe delete $ServiceName 2>$null | Out-Null
}

schtasks /Delete /TN $TaskName /F 2>$null | Out-Null

Write-Host "Removed service '$ServiceName' and task '$TaskName' (if they existed)."
