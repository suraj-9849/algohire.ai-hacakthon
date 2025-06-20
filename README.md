# Collaborative Candidate Notes

A simple real-time platform for hiring teams to share candidate notes and collaborate during interviews.

##  What it does

- **Real-time messaging** for each candidate
- **@mention teammates** to get their attention  
- **Live notifications** when someone mentions you
- **Simple dashboard** to see all candidates and notifications

## 🛠 Tech Stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript  
- **Database:** Firebase (Firestore + Realtime Database)
- **Authentication:** Firebase Auth

##  Quick Start

### 1. Install Dependencies
```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Setup Environment

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Create `apps/backend/.env`:
```env
NODE_ENV=development
PORT=5001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 3. Run the App

**Option 1: Traditional way**
```bash
# Start frontend (Terminal 1)
cd apps/web
pnpm dev

# Start backend (Terminal 2)  
cd apps/backend
pnpm dev
```

**Option 2: Using Docker**
```bash
# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Visit http://localhost:3000 🎉


## 🔧 Available Commands

```bash
pnpm dev              # Start both apps
pnpm dev:web          # Frontend only
pnpm dev:backend      # Backend only

# Building
pnpm build            # Build both apps
pnpm type-check       # Check TypeScript
pnpm lint             # Run ESLint

# Docker
docker-compose up     # Run with Docker
docker-compose down   # Stop Docker containers
```

##  How to Use

1. **Sign up** with email/password
2. **Add candidates** from the dashboard  
3. **Click a candidate** to start chatting
4. **Use @username** to mention teammates
5. **Check notifications** for your mentions

## Firebase Setup

1. Create a Firebase project
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**  
4. Enable **Realtime Database**
5. Get your config and service account key
6. Update the `.env` files


---

**Built for Algohire Hackathon**
