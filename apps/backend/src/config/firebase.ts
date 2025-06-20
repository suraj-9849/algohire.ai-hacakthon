import admin from 'firebase-admin'

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Initialize with environment variables or service account
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Production: Use service account key
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL || "https://algohire-ai-notes-default-rtdb.firebaseio.com/"
        })
      } else {
        // Development: Initialize with project ID (for local development)
        const projectId = process.env.FIREBASE_PROJECT_ID || "algohire-ai-notes"
        const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://algohire-ai-notes-default-rtdb.firebaseio.com/"
        
        admin.initializeApp({
          projectId: projectId,
          databaseURL: databaseURL
        })
      }
      console.log('✅ Firebase Admin initialized successfully')
    } catch (error) {
      console.error('❌ Firebase Admin initialization failed:', error)
      // In development, we can still proceed without Firebase for basic server functionality
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Running in development mode without Firebase')
      } else {
        throw error
      }
    }
  }
}

// Initialize first, then export services
let auth: admin.auth.Auth
let firestore: admin.firestore.Firestore  
let database: admin.database.Database

// Export getter functions instead of direct instances
export const getAuth = () => {
  if (!auth) auth = admin.auth()
  return auth
}

export const getFirestore = () => {
  if (!firestore) firestore = admin.firestore()
  return firestore
}

export const getDatabase = () => {
  if (!database) database = admin.database()
  return database
}

export { auth, firestore, database }
export default admin 