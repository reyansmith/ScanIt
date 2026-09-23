@echo off
cd /d "%~dp0"
echo ===================================================
echo             Starting MediScan Servers
echo ===================================================

:: Check for Python 3.12 (prioritizing Python 3.12 over MSYS2/Conda python)
set "PY_CMD="
if exist "C:\Users\asus\AppData\Local\Programs\Python\Python312\python.exe" (
    set "PY_CMD=C:\Users\asus\AppData\Local\Programs\Python\Python312\python.exe"
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set "PY_CMD=py -3.12"
    ) else (
        set "PY_CMD=python"
    )
)

echo [1/2] Starting Backend Server (Port 8000)...
start "MediScan Backend" cmd /k "cd /d "%~dp0backend" && %PY_CMD% -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Starting Frontend Server (Port 5173)...
start "MediScan Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo Done! Both servers are starting up in separate windows.
echo - Backend:  http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
echo - Frontend: http://localhost:5173
echo ===================================================
pause
