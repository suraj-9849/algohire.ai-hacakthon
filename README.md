# Collaborative Candidate Notes MVP

A real-time collaborative note-taking application for recruiters and hiring managers, built with Next.js, Firebase, and TanStack Query.

## 🚀 Features

### Core Functionality
- **Authentication**: Secure email/password signup and login
- **Dashboard**: Clean interface with candidate list and notifications
- **Real-time Messaging**: Live chat interface for each candidate
- **@Username Tagging**: Autocomplete mention system with notifications
- **Global Notifications**: Dashboard card showing all tagged messages

### Advanced Features
- **Real-time Updates**: Firebase Realtime Database for instant message delivery
- **Route Protection**: Secure pages with authentication guards
- **Mobile Responsive**: Optimized for all device sizes
- **Modern UI**: ShadCN UI components with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + React 18
- **Styling**: Tailwind CSS + ShadCN UI
- **State Management**: TanStack Query
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore + Realtime Database
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Monorepo**: Turborepo

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd algohire-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/web
   npm install
   ```

3. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Create Firestore database
   - Enable Realtime Database
   - Copy your config values

4. **Environment Setup**
   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   
   # Or from apps/web
   cd apps/web
   npm run dev
   ```

## 🎯 Usage Guide

### Getting Started
1. Visit `http://localhost:3000`
2. Create an account or sign in
3. Add candidates from the dashboard
4. Click on any candidate to open the notes interface
5. Type messages and use @username to mention other users
6. Check notifications panel for mentions

### Key Features Demo
- **Add Candidates**: Use the "Add Candidate" button on the dashboard
- **Real-time Chat**: Messages appear instantly for all users viewing the same candidate
- **@Mentions**: Type @ followed by a name for autocomplete suggestions
- **Notifications**: Mentioned users see real-time notifications with navigation

## 🏗️ Architecture

```
apps/web/
├── app/                    # Next.js App Router
├── components/            
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Main dashboard features
│   ├── providers/         # Context providers
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── public/                # Static assets
```

### Key Components
- **AuthProvider**: Authentication context and state management
- **Dashboard**: Main application interface
- **CandidateNotesDialog**: Real-time messaging interface
- **NotificationsList**: @mention notifications system

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
- ESLint configuration for code quality
- TypeScript for type safety
- Prettier for code formatting
- React Hook Form with Zod validation

## 🚀 Deployment

### Recommended Deployment (Azure)
1. **Azure Static Web Apps**
   ```bash
   npm run build
   # Deploy to Azure Static Web Apps
   ```

2. **Alternative: Vercel**
   ```bash
   npm run build
   # Deploy to Vercel
   ```

### Environment Variables
Ensure all Firebase environment variables are configured in your deployment platform.

## 🛡️ Security

- **Route Protection**: Unauthenticated users redirected to login
- **Input Sanitization**: XSS protection for user messages
- **Firebase Security Rules**: Firestore and Realtime Database rules
- **Type Validation**: Zod schemas for data validation

## 📱 Mobile Responsive

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Mobile-friendly interactions
- **Progressive Enhancement**: Core functionality works everywhere

## ⚡ Performance

- **Real-time Updates**: Firebase Realtime Database for instant messaging
- **Optimistic Updates**: UI updates before server confirmation
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Components loaded on demand

## 🔮 Future Enhancements

If given more time, I would implement:

1. **Rich Text Editor**: Bold, italic, links in messages
2. **File Attachments**: Upload images/documents to notes
3. **Message Search**: Search through all candidate notes
4. **Read Receipts**: Show who's read which messages
5. **Online Status**: Show who's currently viewing a candidate
6. **Export Features**: Download candidate notes as PDF
7. **Dark/Light Theme**: Toggle between themes
8. **Keyboard Shortcuts**: Power user features
9. **Message Reactions**: Emoji reactions to messages
10. **Role-based Permissions**: Admin vs regular user roles

## 📞 Support

For any questions or issues, please contact:
- **Developer**: [Your Name]
- **Email**: [Your Email]
- **GitHub**: [Your GitHub Profile]

## 📄 License

This project is built for the Algohire Full-Stack Developer Hiring Hackathon.

---

**Built with ❤️ for the Algohire team**
