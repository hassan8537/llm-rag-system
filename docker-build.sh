#!/bin/bash

# Docker build and deployment script for Motor Backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Motor Backend Docker Build Script${NC}"
echo "=================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t motor-backend:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Check if user wants to run the container
read -p "Do you want to start the application with docker-compose? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🐳 Starting application with docker-compose...${NC}"
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Application started successfully!${NC}"
        echo -e "${GREEN}🌐 API available at: http://localhost:3000${NC}"
        echo -e "${GREEN}📊 Health check: http://localhost:3000/health${NC}"
        echo -e "${YELLOW}📝 View logs: docker-compose logs -f app${NC}"
        echo -e "${YELLOW}🛑 Stop application: docker-compose down${NC}"
    else
        echo -e "${RED}❌ Failed to start application!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 Build completed!${NC}"
