@echo off
cd /d "%~dp0"
echo ===================================================
echo             Starting MediScan Servers
echo ===================================================

echo [1/2] Starting Backend Server (Port 8000)...
start "MediScan Backend" cmd /k "cd /d ""%~dp0backend"" && npm run dev"

echo [2/2] Starting Frontend Server (Port 5173)...
start "MediScan Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ===================================================
echo Done! Both servers are starting up in separate windows.
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:5173
echo ===================================================
pause
