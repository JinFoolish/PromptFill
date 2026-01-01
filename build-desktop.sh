#!/bin/bash

echo "Building desktop application with Wails..."

# Check if wails is installed
if ! command -v wails &> /dev/null; then
    echo "Wails is not installed. Please install it first:"
    echo "go install github.com/wailsapp/wails/v2/cmd/wails@latest"
    exit 1
fi

# Build the application
echo "Building application..."
wails build

if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    echo "Executable can be found in the build/bin directory"
else
    echo "Build failed!"
    exit 1
fi