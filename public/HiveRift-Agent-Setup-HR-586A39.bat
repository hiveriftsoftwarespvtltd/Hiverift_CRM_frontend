@echo off
title HiveRift WFH Monitoring Agent Setup
echo ====================================================
echo        HIVERIFT CRM - WFH MONITORING AGENT
echo ====================================================
echo.
echo [*] Pairing device with token: HR-586A39...
cd /d "%~dp0"
if exist register.js (
    node register.js HR-586A39 http://localhost:5000/api/v1
    call start-agent.bat
) else (
    echo [INFO] Registering HiveRift Agent with Server...
    powershell -Command "Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/monitoring/device/register' -Method Post -ContentType 'application/json' -Body '{\"pairingToken\":\"HR-586A39\",\"deviceName\":\"$env:COMPUTERNAME\",\"os\":\"Windows\"}'"
)
echo.
echo ====================================================
echo  SUCCESS! HiveRift Agent paired for Samunder.
echo ====================================================
pause
