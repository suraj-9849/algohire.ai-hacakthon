import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getAuth } from '@/config/firebase'
import { createError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401)
    }

    // Verify Firebase token
    const decodedToken = await getAuth().verifyIdToken(token)
    
    // Get user details
    const userRecord = await getAuth().getUser(decodedToken.uid)
    
    req.user = {
      id: userRecord.uid,
      email: userRecord.email!,
      name: (userRecord.displayName || userRecord.email!.split('@')[0]) as string
    }

    next()
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      throw createError('Token expired', 401)
    }
    if (error.code === 'auth/id-token-revoked') {
      throw createError('Token revoked', 401)
    }
    throw createError('Invalid token', 401)
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decodedToken = await getAuth().verifyIdToken(token)
      const userRecord = await getAuth().getUser(decodedToken.uid)
      
      req.user = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: (userRecord.displayName || userRecord.email!.split('@')[0]) as string
      }
    }

    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
} 