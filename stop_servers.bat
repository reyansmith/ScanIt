@echo off
echo Stopping any running MediScan processes on ports 8000 and 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating backend process PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating frontend process PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Done! Ports 8000 and 5173 have been released.
pause

