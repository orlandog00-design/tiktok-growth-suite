@echo off
title TikTok Growth Suite - Online Share Server
echo ====================================================
echo Starting TikTok Growth Suite & Clipper (Online Mode)
echo ====================================================
echo.

:: Check if port 3000 is open; start server if not
netstat -ano | findstr :3000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Node backend server on port 3000...
    start "TikTok Growth Suite Node Server" /B node server.js
    timeout /t 2 /nobreak >nul
) else (
    echo Node backend server is already running on port 3000.
)

echo.
echo ====================================================
echo Your Live Custom Short URL:
echo https://encryptthegoat.loca.lt
echo ====================================================
echo.
echo Starting tunnel... (Press Ctrl+C to stop)
npx localtunnel --port 3000 --subdomain encryptthegoat
pause
