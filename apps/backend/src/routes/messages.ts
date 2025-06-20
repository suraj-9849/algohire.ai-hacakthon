import { Router } from 'express'
import { getDatabase, getFirestore } from '@/config/firebase'
import { createMessageSchema, messageQuerySchema } from '@repo/shared'
import { asyncHandler, createError } from '@/middleware/errorHandler'
import { AuthRequest, authenticateToken } from '@/middleware/auth'

const router = Router()

// Get messages for a candidate
router.get('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { candidateId, page, limit } = messageQuerySchema.parse(req.query)

  try {
    // Get messages from Realtime Database
    const messagesRef = getDatabase().ref(`messages/${candidateId}`)
    const snapshot = await messagesRef.once('value')
    
    if (!snapshot.exists()) {
      return res.json({
        success: true,
        data: {
          messages: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        }
      })
    }

    const messagesData = snapshot.val()
    const messages = Object.keys(messagesData).map(key => ({
      id: key,
      ...messagesData[key],
      timestamp: new Date(messagesData[key].timestamp)
    })).sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())

    // Simple pagination
    const offset = (page - 1) * limit
    const paginatedMessages = messages.slice(offset, offset + limit)

    res.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          page,
          limit,
          total: messages.length,
          totalPages: Math.ceil(messages.length / limit),
          hasNext: offset + limit < messages.length,
          hasPrev: page > 1
        }
      }
    })
  } catch (error) {
    throw createError('Failed to fetch messages', 500)
  }
}))

// Create new message
router.post('/', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const { candidateId, content } = createMessageSchema.parse(req.body)
  const user = req.user

  try {
    // Verify candidate exists
    const candidateDoc = await getFirestore().collection('candidates').doc(candidateId).get()
    if (!candidateDoc.exists) {
      throw createError('Candidate not found', 404)
    }

    const candidateData = candidateDoc.data()

    // Extract mentions from content
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1]
      // Find user by name
      const usersSnapshot = await getFirestore().collection('users')
        .where('name', '==', mentionedName)
        .get()
      
      if (!usersSnapshot.empty && usersSnapshot.docs[0]?.id) {
        mentions.push(usersSnapshot.docs[0].id)
      }
    }

    const messageData = {
      candidateId,
      content,
      senderId: user.id,
      senderName: user.name,
      timestamp: Date.now(),
      mentions
    }

    // Save to Realtime Database for real-time updates
    const messageRef = await getDatabase().ref(`messages/${candidateId}`).push(messageData)

    // Create notifications for mentioned users
    for (const mentionedUserId of mentions) {
      await getFirestore().collection('notifications').add({
        userId: mentionedUserId,
        messageId: messageRef.key,
        candidateId,
        candidateName: candidateData?.name || 'Unknown',
        content,
        senderName: user.name,
        timestamp: new Date(),
        read: false
      })
    }

    // Emit real-time event
    const io = req.app.get('io')
    io.to(`candidate_${candidateId}`).emit('new_message', {
      id: messageRef.key,
      ...messageData,
      timestamp: new Date(messageData.timestamp)
    })

    // Emit notifications to mentioned users
    for (const mentionedUserId of mentions) {
      io.to(`user_${mentionedUserId}`).emit('new_notification', {
        candidateId,
        candidateName: candidateData?.name || 'Unknown',
        content,
        senderName: user.name
      })
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: messageRef.key,
        ...messageData,
        timestamp: new Date(messageData.timestamp)
      }
    })
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError('Failed to send message', 500)
  }
}))

export { router as messageRoutes } 