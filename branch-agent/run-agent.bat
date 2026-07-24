@echo off
REM Restart wrapper: keeps the EMS branch agent alive if it crashes.
REM Add a Startup shortcut to this file, or use NSSM as a Windows Service.
cd /d "%~dp0"

:loop
echo [%date% %time%] Starting EMS Branch Agent (CLI)...
node src/cli.js
echo [%date% %time%] Agent exited with code %ERRORLEVEL%. Restarting in 5 seconds...
timeout /t 5 /nobreak >nul
goto loop
