#  Docker Setup Guide

Simple Docker setup for running the Collaborative Candidate Notes application.

##  What You Get

- **Frontend**: Next.js app running on port 3000
- **Backend**: Node.js API running on port 5001
- **Simple Configuration**: No complex multi-stage builds
- **Easy Development**: One command to run everything

##  Quick Start

### 1. Prerequisites
Make sure you have Docker installed:
```bash
# Check if Docker is installed
docker --version
docker-compose --version
```

### 2. Setup Environment Files
Create your `.env` files first (see main README for details):
- `apps/web/.env.local` - Frontend environment
- `apps/backend/.env` - Backend environment

### 3. Run with Docker
```bash
# Build and start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

That's it! Visit:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001

##  Docker Files Explained

### Frontend Dockerfile (`apps/web/Dockerfile`)

### Backend Dockerfile (`apps/backend/Dockerfile`)

### Docker Compose (`docker-compose.yml`)

## 🔧 Useful Commands

```bash
# Build images
docker-compose build

# Start in background
docker-compose up -d

# View live logs
docker-compose logs -f

# View logs for specific service
docker-compose logs frontend
docker-compose logs backend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Remove everything (including volumes)
docker-compose down -v
docker system prune -a
```

### Using Different Environments
```bash
# Development
docker-compose up -d

# Production-like
docker-compose -f docker-compose.prod.yml up -d
```


**Simple Docker setup for simple development!**