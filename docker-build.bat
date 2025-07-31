@echo off
echo 🚀 Motor Backend Docker Build Script
echo ==================================

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t motor-backend:latest .

if %ERRORLEVEL% equ 0 (
    echo ✅ Docker image built successfully!
) else (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

REM Ask if user wants to run the container
set /p choice="Do you want to start the application with docker-compose? (y/n): "
if /i "%choice%"=="y" (
    echo 🐳 Starting application with docker-compose...
    docker-compose up -d
    
    if %ERRORLEVEL% equ 0 (
        echo ✅ Application started successfully!
        echo 🌐 API available at: http://localhost:3000
        echo 📊 Health check: http://localhost:3000/health
        echo 📝 View logs: docker-compose logs -f app
        echo 🛑 Stop application: docker-compose down
    ) else (
        echo ❌ Failed to start application!
        pause
        exit /b 1
    )
)

echo 🎉 Build completed!
pause
