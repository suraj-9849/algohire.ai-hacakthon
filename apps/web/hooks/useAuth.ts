import { useState, useEffect } from 'react'
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '@/lib/firebase'
import { User } from '@/lib/types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            createdAt: userData.createdAt.toDate()
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name
    await updateProfile(firebaseUser, { displayName: name })
    
    // Save additional user data to Firestore
    await setDoc(doc(firestore, 'users', firebaseUser.uid), {
      name,
      email,
      createdAt: new Date()
    })

    // Set user state immediately
    setUser({
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: name,
      createdAt: new Date()
    })

    return firebaseUser
  }

  const signIn = async (email: string, password: string) => {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
    return firebaseUser
  }

  const logout = async () => {
    await signOut(auth)
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    logout
  }
} 