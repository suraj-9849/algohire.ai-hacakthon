import { io, Socket } from 'socket.io-client'
import { auth } from './firebase'

class SocketService {
  private socket: Socket | null = null
  private connected = false

  async connect() {
    if (this.connected && this.socket) {
      return this.socket
    }

    const user = auth.currentUser
    if (!user) {
      throw new Error('User must be authenticated to connect to socket')
    }

    const token = await user.getIdToken()
    const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      autoConnect: true
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.connected = true
      this.socket?.emit('user_online')
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.connected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.connected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
    }
  }

  getSocket() {
    return this.socket
  }

  isConnected() {
    return this.connected && this.socket?.connected
  }

  // Candidate room methods
  joinCandidateRoom(candidateId: string) {
    if (this.socket) {
      this.socket.emit('join_candidate', candidateId)
    }
  }

  leaveCandidateRoom(candidateId: string) {
    if (this.socket) {
      this.socket.emit('leave_candidate', candidateId)
    }
  }

  // Typing indicators
  startTyping(candidateId: string) {
    if (this.socket) {
      this.socket.emit('typing_start', candidateId)
    }
  }

  stopTyping(candidateId: string) {
    if (this.socket) {
      this.socket.emit('typing_stop', candidateId)
    }
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onNewNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('new_notification', callback)
    }
  }

  onUserTyping(callback: (data: { userId: string; userName: string; candidateId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onUserStoppedTyping(callback: (data: { userId: string; candidateId: string }) => void) {
    if (this.socket) {
      this.socket.on('user_stopped_typing', callback)
    }
  }

  onUserStatusChange(callback: (data: { userId: string; userName: string; status: 'online' | 'offline' }) => void) {
    if (this.socket) {
      this.socket.on('user_status_change', callback)
    }
  }

  // Remove event listeners
  offNewMessage() {
    if (this.socket) {
      this.socket.off('new_message')
    }
  }

  offNewNotification() {
    if (this.socket) {
      this.socket.off('new_notification')
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing')
    }
  }

  offUserStoppedTyping() {
    if (this.socket) {
      this.socket.off('user_stopped_typing')
    }
  }

  offUserStatusChange() {
    if (this.socket) {
      this.socket.off('user_status_change')
    }
  }
}

export const socketService = new SocketService()
export default socketService 