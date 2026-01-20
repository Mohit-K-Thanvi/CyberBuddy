@echo off
TITLE CyberBuddy AI System
COLOR 0A
CLS

ECHO ===================================================
ECHO      CYBERBUDDY X - SECURITY SYSTEM STARTUP
ECHO ===================================================
ECHO.
ECHO [*] Initializing AI Neural Core...
ECHO [*] Starting Backend Secure Server (Port 8000)...
start "CyberBuddy Backend" cmd /k "cd backend && python -m uvicorn main:app --reload --port 8000"

ECHO [*] Launching Interactive Dashboard (Port 3000)...
start "CyberBuddy Frontend" cmd /k "cd frontend && npm run dev"

ECHO.
ECHO [SUCCESS] System is Online!
ECHO.
ECHO 1. Backend API: http://127.0.0.1:8000
ECHO 2. Dashboard:   http://localhost:3000
ECHO 3. Extension:   Ready to connect
ECHO.
ECHO Keep these windows open while using the tools.
ECHO Close them to shut down the system.
PAUSE
