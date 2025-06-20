import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCWzpYlPAyjM_OzWQSsDXu93DTUWGj34VA",
  authDomain: "algohire-ai-notes.firebaseapp.com",
  projectId: "algohire-ai-notes",
  storageBucket: "algohire-ai-notes.firebasestorage.app",
  messagingSenderId: "464861618688",
  appId: "1:464861618688:web:de805fb03ebf8f54aeaee5",
  measurementId: "G-W76MM94R8X",
  databaseURL: "https://algohire-ai-notes-default-rtdb.firebaseio.com/"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const database = getDatabase(app)

// Initialize Analytics (only in browser)
let analytics: any = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}
export { analytics }

export default app 