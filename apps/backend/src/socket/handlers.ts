import { Server } from 'socket.io'
import { auth } from '@/config/firebase'

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication error'))
      }

      // Verify Firebase token
      const decodedToken = await auth.verifyIdToken(token)
      const userRecord = await auth.getUser(decodedToken.uid)
      
      socket.data.user = {
        id: userRecord.uid,
        email: userRecord.email!,
        name: userRecord.displayName || userRecord.email!.split('@')[0]
      }

      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user
    console.log(`User connected: ${user.name} (${user.id})`)

    // Join user to their personal room for notifications
    socket.join(`user_${user.id}`)

    // Handle joining candidate rooms
    socket.on('join_candidate', (candidateId: string) => {
      socket.join(`candidate_${candidateId}`)
      console.log(`User ${user.name} joined candidate room: ${candidateId}`)
    })

    // Handle leaving candidate rooms
    socket.on('leave_candidate', (candidateId: string) => {
      socket.leave(`candidate_${candidateId}`)
      console.log(`User ${user.name} left candidate room: ${candidateId}`)
    })

    // Handle typing indicators
    socket.on('typing_start', (candidateId: string) => {
      socket.to(`candidate_${candidateId}`).emit('user_typing', {
        userId: user.id,
        userName: user.name,
        candidateId
      })
    })

    socket.on('typing_stop', (candidateId: string) => {
      socket.to(`candidate_${candidateId}`).emit('user_stopped_typing', {
        userId: user.id,
        candidateId
      })
    })

    // Handle user presence (online/offline)
    socket.on('user_online', () => {
      socket.broadcast.emit('user_status_change', {
        userId: user.id,
        userName: user.name,
        status: 'online'
      })
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name} (${user.id})`)
      socket.broadcast.emit('user_status_change', {
        userId: user.id,
        userName: user.name,
        status: 'offline'
      })
    })

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Collaborative Notes',
      user: user
    })
  })

  return io
} 