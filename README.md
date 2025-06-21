# Collaborative Candidate Notes

A modern collaborative platform for managing candidate notes and mentions, built for the AlgoHire hackathon.

## **Architecture**

- **Frontend:** Next.js 14 + TypeScript + TailwindCSS
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth
- **Real-time:** Firebase real-time listeners
- **UI Components:** Shadcn/ui
- **State Management:** TanStack Query
- **Styling:** TailwindCSS

## **Features**

- **Real-time Collaboration:** Multiple users can add notes simultaneously
- **@Mentions System:** Mention team members and notify them instantly
- **Candidate Management:** Add, edit, and manage candidate profiles
- **Live Notifications:** Real-time notifications for mentions and updates
- **Search & Filter:** Find candidates quickly with advanced search
- **Responsive Design:** Works perfectly on desktop and mobile

## **Quick Start**

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Firebase project setup

### Environment Setup

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

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev:web

# Or start all apps
pnpm dev
```

### Available Scripts

```bash
pnpm dev              # Start all development servers
pnpm dev:web          # Frontend only
pnpm build            # Build all applications
pnpm build:web        # Build frontend
pnpm lint             # Run linting
pnpm type-check       # TypeScript type checking
```

##  **Firebase Setup**

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Set up Firestore security rules
5. Copy your Firebase config to `.env.local`

## 📱 **Usage**

1. **Sign Up/Login:** Create an account or sign in
2. **Add Candidates:** Click "Add Candidate" to create profiles
3. **Add Notes:** Click on any candidate to add collaborative notes
4. **Mention Users:** Use @username to mention team members
5. **Real-time Updates:** See changes and notifications instantly


### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## **Tech Stack Details**

- **Next.js 14:** App Router, Server Components, TypeScript
- **Firebase:** Firestore, Auth, Real-time listeners
- **TanStack Query:** Server state management and caching
- **Shadcn/ui:** Modern, accessible UI components
- **TailwindCSS:** Utility-first CSS framework
- **Turbo:** Monorepo build system
