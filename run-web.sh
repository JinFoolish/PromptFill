#!/bin/bash

echo "Starting AI Image Generation Web Server..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Go is not installed. Please install Go first."
    exit 1
fi

# Start the Go backend server
echo "Starting Go backend server on port 8080..."
cd backend
go run .