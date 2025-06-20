import { Router } from 'express'
import { getAuth, getFirestore } from '@/config/firebase'
import { signUpSchema, signInSchema } from '@repo/shared'
import { asyncHandler, createError } from '@/middleware/errorHandler'
import { AuthRequest, authenticateToken } from '@/middleware/auth'

const router = Router()

// Register new user
router.post('/signup', asyncHandler(async (req: { body: unknown }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data: { user: { id: any; email: any; name: string }; customToken: any } }): void; new(): any } } }) => {
  const { name, email, password } = signUpSchema.parse(req.body)

  try {
    // Create Firebase user
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name
    })

    // Save additional user data to Firestore
    await getFirestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      createdAt: new Date()
    })

    // Generate custom token for immediate login
    const customToken = await getAuth().createCustomToken(userRecord.uid)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: userRecord.uid,
          email: userRecord.email,
          name: name
        },
        customToken
      }
    })
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw createError('Email already exists', 400)
    }
    if (error.code === 'auth/weak-password') {
      throw createError('Password is too weak', 400)
    }
    throw createError('Failed to create user', 500)
  }
}))

// Sign in user (This endpoint is mainly for validation, actual auth happens on frontend)
router.post('/signin', asyncHandler(async (req: { body: unknown }, res: { json: (arg0: { success: boolean; message: string; data: { userId: any; email: any } }) => void }) => {
  const { email, password } = signInSchema.parse(req.body)

  try {
    // Get user by email to check if exists
    const userRecord = await getAuth().getUserByEmail(email)
    
    res.json({
      success: true,
      message: 'User exists, proceed with Firebase Auth on client',
      data: {
        userId: userRecord.uid,
        email: userRecord.email
      }
    })
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw createError('Invalid email or password', 401)
    }
    throw createError('Authentication failed', 500)
  }
}))

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res: { json: (arg0: { success: boolean; data: { id: string; email: string; name: any; createdAt: any } }) => void }) => {
  const userId = req.user!.id

  try {
    const userDoc = await getFirestore().collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      throw createError('User not found', 404)
    }

    const userData = userDoc.data()
    
    res.json({
      success: true,
      data: {
        id: userId,
        email: req.user!.email,
        name: userData?.name || req.user!.name,
        createdAt: userData?.createdAt?.toDate()
      }
    })
  } catch (error) {
    throw createError('Failed to get user profile', 500)
  }
}))

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res: { json: (arg0: { success: boolean; message: string; data: { name: any } }) => void }) => {
  const userId = req.user!.id
  const { name } = req.body

  if (!name || name.trim().length < 2) {
    throw createError('Name must be at least 2 characters', 400)
  }

  try {
    // Update in Firebase Auth
    await getAuth().updateUser(userId, {
      displayName: name.trim()
    })

    // Update in Firestore
    await getFirestore().collection('users').doc(userId).update({
      name: name.trim(),
      updatedAt: new Date()
    })

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: name.trim()
      }
    })
  } catch (error) {
    throw createError('Failed to update profile', 500)
  }
}))

// Verify token (health check for auth)
router.get('/verify', authenticateToken, asyncHandler(async (req: AuthRequest, res: { json: (arg0: { success: boolean; message: string; data: { user: { id: string; email: string; name: string } | undefined } }) => void }) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  })
}))

export { router as authRoutes } 