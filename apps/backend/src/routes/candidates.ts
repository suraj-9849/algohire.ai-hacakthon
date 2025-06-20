import { Router } from 'express'
import { getFirestore } from '@/config/firebase'
import { createCandidateSchema, updateCandidateSchema, candidateQuerySchema } from '@repo/shared'
import { asyncHandler, createError } from '@/middleware/errorHandler'
import { AuthRequest, authenticateToken } from '@/middleware/auth'

const router = Router()

// Get all candidates
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: { json: (arg0: { success: boolean; data: { candidates: any; pagination: { page: any; limit: any; total: any; totalPages: number; hasNext: boolean; hasPrev: boolean } } }) => void }) => {
  const { page, limit, search } = candidateQuerySchema.parse(req.query)
  const offset = (page - 1) * limit

  try {
    let query = getFirestore().collection('candidates').orderBy('createdAt', 'desc')

    if (search) {
      query = query.where('name', '>=', search).where('name', '<=', search + '\uf8ff')
    }

    const snapshot = await query.limit(limit).offset(offset).get()
    const candidates = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      }
    })

    const totalSnapshot = await getFirestore().collection('candidates').get()
    const total = totalSnapshot.size

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    throw createError('Failed to fetch candidates', 500)
  }
}))

// Create new candidate
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { success: boolean; message: string; data: { name: any; email: any; createdAt: Date; createdBy: string; id: any } }): void; new(): any } } }) => {
  const { name, email } = createCandidateSchema.parse(req.body)
  const userId = req.user!.id

  try {
    const existingCandidate = await getFirestore().collection('candidates')
      .where('email', '==', email)
      .get()

    if (!existingCandidate.empty) {
      throw createError('Candidate with this email already exists', 400)
    }

    const candidateData = {
      name,
      email,
      createdAt: new Date(),
      createdBy: userId
    }

    const candidateRef = await getFirestore().collection('candidates').add(candidateData)

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: {
        id: candidateRef.id,
        ...candidateData
      }
    })
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError('Failed to create candidate', 500)
  }
}))

export { router as candidateRoutes } 