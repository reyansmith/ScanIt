@echo off
echo Starting MediScan Servers...

echo [1/2] Starting Backend Server (Port 8000)...
start cmd /k "cd backend && C:\Users\asus\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn app.main:app --reload"

echo [2/2] Starting Frontend Server (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo Done! Both servers are starting up in new windows.
pause
