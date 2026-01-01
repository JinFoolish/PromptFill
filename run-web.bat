@echo off
echo Starting AI Image Generation Web Server...

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo Go is not installed. Please install Go first.
    exit /b 1
)

REM Start the Go backend server
echo Starting Go backend server on port 8080...
cd backend
go run .

pause