import { Router } from 'express'
import { getFirestore } from '@/config/firebase'
import { notificationQuerySchema, markNotificationReadSchema } from '@repo/shared'
import { asyncHandler, createError } from '@/middleware/errorHandler'
import { AuthRequest, authenticateToken } from '@/middleware/auth'

const router = Router()

// Get user notifications
router.get('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { page, limit, unreadOnly } = notificationQuerySchema.parse(req.query)
  const userId = req.user.id
  const offset = (page - 1) * limit

  try {
    let query = getFirestore().collection('notifications')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')

    if (unreadOnly) {
      query = query.where('read', '==', false)
    }

    const snapshot = await query.limit(limit).offset(offset).get()
    const notifications = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }))

    // Get total count
    let countQuery = getFirestore().collection('notifications').where('userId', '==', userId)
    if (unreadOnly) {
      countQuery = countQuery.where('read', '==', false)
    }
    const countSnapshot = await countQuery.get()
    const total = countSnapshot.size

    res.json({
      success: true,
      data: {
        notifications,
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
    throw createError('Failed to fetch notifications', 500)
  }
}))

// Mark notification as read
router.patch('/:id', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { id } = req.params
  const { read } = markNotificationReadSchema.parse(req.body)
  const userId = req.user.id

  try {
    const notificationDoc = await getFirestore().collection('notifications').doc(id).get()
    
    if (!notificationDoc.exists) {
      throw createError('Notification not found', 404)
    }

    const notificationData = notificationDoc.data()
    
    // Check if notification belongs to the user
    if (notificationData?.userId !== userId) {
      throw createError('Unauthorized', 403)
    }

    await getFirestore().collection('notifications').doc(id).update({
      read,
      readAt: read ? new Date() : null
    })

    res.json({
      success: true,
      message: `Notification marked as ${read ? 'read' : 'unread'}`
    })
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError('Failed to update notification', 500)
  }
}))

// Mark all notifications as read
router.patch('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const userId = req.user.id

  try {
    const unreadNotifications = await getFirestore().collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get()

    const batch = getFirestore().batch()
    
    unreadNotifications.docs.forEach((doc: any) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date()
      })
    })

    await batch.commit()

    res.json({
      success: true,
      message: `${unreadNotifications.size} notifications marked as read`
    })
  } catch (error) {
    throw createError('Failed to mark notifications as read', 500)
  }
}))

// Get unread count
router.get('/unread-count', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const userId = req.user.id

  try {
    const unreadSnapshot = await getFirestore().collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get()

    res.json({
      success: true,
      data: {
        unreadCount: unreadSnapshot.size
      }
    })
  } catch (error) {
    throw createError('Failed to get unread count', 500)
  }
}))

export { router as notificationRoutes } 