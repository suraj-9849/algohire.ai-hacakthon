# Docker Setup Guide

This guide explains how to run the Collaborative Candidate Notes application using Docker.

##  **Architecture Overview**

- **Frontend**: Next.js application running on port 3000
- **Database**: Firebase Firestore (cloud-hosted)
- **Authentication**: Firebase Auth (cloud-hosted)

## **Prerequisites**

- Docker and Docker Compose installed
- Firebase project configured
- Environment variables set up

## ⚙️ **Configuration**
### Frontend Environment

Create `apps/web/.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## **Running with Docker**

### Quick Start
```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build
```

### Accessing the Application
- **Frontend**: http://localhost:3000

## 🔧 **Docker Commands**

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild and restart
docker-compose down && docker-compose up --build

# View only frontend logs
docker-compose logs frontend
```

For more information, see the main [README.md](./README.md)