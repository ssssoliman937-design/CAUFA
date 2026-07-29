@echo off
title SHEFOtube PRO 4K Server Launcher
color 0A
cls
echo ========================================================
echo   🚀 SHEFOtube PRO 4K - Server Launcher
echo ========================================================
echo.
echo  [1] Starting Node Server...
echo  [2] Opening SHEFOtube in Browser (http://localhost:3000)...
echo.

cd /d "%~dp0"

timeout /t 2 /nobreak >nul
start http://localhost:3000
node server.js

pause
