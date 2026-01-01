@echo off
echo Building desktop application with Wails...

REM Check if wails is installed
wails version >nul 2>&1
if %errorlevel% neq 0 (
    echo Wails is not installed. Please install it first:
    echo go install github.com/wailsapp/wails/v2/cmd/wails@latest
    exit /b 1
)

REM Build the application
echo Building application...
wails build

if %errorlevel% equ 0 (
    echo Build completed successfully!
    echo Executable can be found in the build/bin directory
) else (
    echo Build failed!
    exit /b 1
)

pause