# Collaborative Candidate Notes - Web App

Modern Next.js frontend for the collaborative candidate notes platform, powered by Firebase.

## 🚀 **Features**

- **Real-time Collaboration**: Multiple users can add notes simultaneously
- **@Mentions System**: Mention team members with instant notifications
- **Modern UI**: Built with Shadcn/ui components and TailwindCSS
- **Responsive Design**: Works perfectly on all devices
- **Firebase Integration**: Direct connection to Firestore and Auth

## 🛠️ **Tech Stack**

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **State Management**: TanStack Query
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase listeners
- **Deployment**: Vercel

## 📦 **Getting Started**

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Firebase project

### Environment Setup

Create `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔥 **Firebase Setup**

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Set up security rules
5. Copy config to `.env.local`

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // All authenticated users can read/write candidates
    match /candidates/{candidateId} {
      allow read, write: if request.auth != null;
    }
    
    // All authenticated users can read/write messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can only read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📁 **Project Structure**

```
apps/web/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── providers/        # Context providers
│   └── ui/               # Shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and services
│   ├── firebase.ts       # Firebase configuration
│   ├── firebase-services.ts  # Firebase service layer
│   ├── messaging-service.ts  # Messaging functionality
│   └── types.ts          # TypeScript types
└── public/               # Static assets
```

## 🎨 **UI Components**

Built with [Shadcn/ui](https://ui.shadcn.com/) for:
- Consistent design system
- Accessibility out of the box
- Customizable components
- TypeScript support

Key components:
- `Button`, `Input`, `Card` - Basic UI elements
- `Dialog`, `Tabs` - Layout components
- `LoadingSpinner`, `Badge` - Feedback components
- `Toaster` - Notification system

## 🔄 **State Management**

Using [TanStack Query](https://tanstack.com/query) for:
- Server state management
- Caching and synchronization
- Real-time updates
- Background refetching
- Optimistic updates

## 🚀 **Deployment**

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Build and deploy
pnpm build
firebase deploy
```

### Docker
```bash
# Build Docker image
docker build -t candidate-notes-web .

# Run container
docker run -p 3000:3000 candidate-notes-web
```

## 🧪 **Testing**

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## 📊 **Performance**

- **Next.js 14**: Latest performance optimizations
- **App Router**: Server components for better performance
- **TanStack Query**: Intelligent caching and background updates
- **Firebase**: Global CDN and optimized real-time connections
- **Code Splitting**: Automatic route-based code splitting

## 🔒 **Security**

- **Firebase Auth**: Secure authentication with JWT tokens
- **Firestore Rules**: Database-level security rules
- **Environment Variables**: Secure configuration management
- **HTTPS Only**: All connections encrypted
- **XSS Protection**: Built-in Next.js security features

## 🤝 **Contributing**

1. Follow the component structure in `components/`
2. Use TypeScript for all new code
3. Follow the existing naming conventions
4. Add proper error handling
5. Test your changes thoroughly

---

Built with ❤️ for the AlgoHire hackathon
