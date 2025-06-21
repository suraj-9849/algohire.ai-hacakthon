import { redis } from './redis'
import { Notification, Candidate, User } from './types'

export interface RealtimeEvent {
  type: 'notification' | 'candidate_update' | 'user_online' | 'user_offline' | 'mention'
  data: any
  userId?: string
  timestamp: number
}

export class RealtimeService {
  private static instance: RealtimeService
  private subscribers: Map<string, (event: RealtimeEvent) => void> = new Map()

  private constructor() {}

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  // Channel names
  private getChannels() {
    return {
      notifications: (userId: string) => `notifications:${userId}`,
      candidateUpdates: (candidateId: string) => `candidate:${candidateId}:updates`,
      userPresence: 'user:presence',
      globalEvents: 'global:events',
      mentions: (userId: string) => `mentions:${userId}`,
    }
  }

  // Subscribe to user-specific notifications
  async subscribeToNotifications(userId: string, callback: (notification: Notification) => void): Promise<void> {
    const channel = this.getChannels().notifications(userId)
    
    await redis.subscribe(channel, (message) => {
      try {
        const event: RealtimeEvent = JSON.parse(message)
        if (event.type === 'notification') {
          callback(event.data)
        }
      } catch (error) {
        console.error('Error parsing notification:', error)
      }
    })
  }

  // Publish notification to user
  async publishNotification(userId: string, notification: Notification): Promise<void> {
    const channel = this.getChannels().notifications(userId)
    const event: RealtimeEvent = {
      type: 'notification',
      data: notification,
      userId,
      timestamp: Date.now(),
    }

    try {
      await redis.publish(channel, event)
    } catch (error) {
      console.error('Error publishing notification:', error)
    }
  }

  // Subscribe to candidate updates
  async subscribeToCandidateUpdates(candidateId: string, callback: (candidate: Candidate) => void): Promise<void> {
    const channel = this.getChannels().candidateUpdates(candidateId)
    
    await redis.subscribe(channel, (message) => {
      try {
        const event: RealtimeEvent = JSON.parse(message)
        if (event.type === 'candidate_update') {
          callback(event.data)
        }
      } catch (error) {
        console.error('Error parsing candidate update:', error)
      }
    })
  }

  // Publish candidate update
  async publishCandidateUpdate(candidate: Candidate): Promise<void> {
    const channel = this.getChannels().candidateUpdates(candidate.id)
    const event: RealtimeEvent = {
      type: 'candidate_update',
      data: candidate,
      timestamp: Date.now(),
    }

    try {
      await redis.publish(channel, event)
    } catch (error) {
      console.error('Error publishing candidate update:', error)
    }
  }

  // Subscribe to mentions
  async subscribeToMentions(userId: string, callback: (mention: any) => void): Promise<void> {
    const channel = this.getChannels().mentions(userId)
    
    await redis.subscribe(channel, (message) => {
      try {
        const event: RealtimeEvent = JSON.parse(message)
        if (event.type === 'mention') {
          callback(event.data)
        }
      } catch (error) {
        console.error('Error parsing mention:', error)
      }
    })
  }

  // Publish mention
  async publishMention(userId: string, mentionData: any): Promise<void> {
    const channel = this.getChannels().mentions(userId)
    const event: RealtimeEvent = {
      type: 'mention',
      data: mentionData,
      userId,
      timestamp: Date.now(),
    }

    try {
      await redis.publish(channel, event)
    } catch (error) {
      console.error('Error publishing mention:', error)
    }
  }

  // User presence tracking
  async setUserOnline(userId: string, userData: Partial<User>): Promise<void> {
    try {
      // Set user as online in Redis with TTL
      await redis.getClient().setex(`presence:${userId}`, 300, JSON.stringify({
        ...userData,
        status: 'online',
        lastSeen: Date.now(),
      }))

      // Publish presence update
      const event: RealtimeEvent = {
        type: 'user_online',
        data: { userId, ...userData },
        timestamp: Date.now(),
      }
      
      await redis.publish(this.getChannels().userPresence, event)
    } catch (error) {
      console.error('Error setting user online:', error)
    }
  }

  async setUserOffline(userId: string): Promise<void> {
    try {
      // Remove user from online presence
      await redis.del(`presence:${userId}`)

      // Publish presence update
      const event: RealtimeEvent = {
        type: 'user_offline',
        data: { userId },
        timestamp: Date.now(),
      }
      
      await redis.publish(this.getChannels().userPresence, event)
    } catch (error) {
      console.error('Error setting user offline:', error)
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    try {
      const keys = await redis.getClient().keys('presence:*')
      return keys.map(key => key.replace('presence:', ''))
    } catch (error) {
      console.error('Error getting online users:', error)
      return []
    }
  }

  async isUserOnline(userId: string): Promise<boolean> {
    try {
      return await redis.exists(`presence:${userId}`)
    } catch (error) {
      console.error('Error checking user online status:', error)
      return false
    }
  }

  // Subscribe to user presence updates
  async subscribeToUserPresence(callback: (event: RealtimeEvent) => void): Promise<void> {
    await redis.subscribe(this.getChannels().userPresence, (message) => {
      try {
        const event: RealtimeEvent = JSON.parse(message)
        callback(event)
      } catch (error) {
        console.error('Error parsing presence update:', error)
      }
    })
  }

  // Heartbeat to maintain user presence
  async heartbeat(userId: string): Promise<void> {
    try {
      const presenceKey = `presence:${userId}`
      const exists = await redis.exists(presenceKey)
      
      if (exists) {
        await redis.expire(presenceKey, 300) // Extend TTL
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error)
    }
  }

  // Global events (system announcements, etc.)
  async publishGlobalEvent(eventData: any): Promise<void> {
    const event: RealtimeEvent = {
      type: 'notification',
      data: eventData,
      timestamp: Date.now(),
    }

    try {
      await redis.publish(this.getChannels().globalEvents, event)
    } catch (error) {
      console.error('Error publishing global event:', error)
    }
  }

  async subscribeToGlobalEvents(callback: (event: RealtimeEvent) => void): Promise<void> {
    await redis.subscribe(this.getChannels().globalEvents, (message) => {
      try {
        const event: RealtimeEvent = JSON.parse(message)
        callback(event)
      } catch (error) {
        console.error('Error parsing global event:', error)
      }
    })
  }

  // Cleanup subscriptions
  async unsubscribe(userId: string): Promise<void> {
    try {
      const channels = [
        this.getChannels().notifications(userId),
        this.getChannels().mentions(userId),
      ]
      
      for (const channel of channels) {
        await redis.getClient().unsubscribe(channel)
      }
      
      this.subscribers.delete(userId)
    } catch (error) {
      console.error('Error unsubscribing:', error)
    }
  }

  // Batch publish for multiple users
  async publishToMultipleUsers(userIds: string[], event: RealtimeEvent): Promise<void> {
    try {
      const promises = userIds.map(userId => {
        const channel = this.getChannels().notifications(userId)
        return redis.publish(channel, { ...event, userId })
      })
      
      await Promise.all(promises)
    } catch (error) {
      console.error('Error publishing to multiple users:', error)
    }
  }

  // Message queue for offline users
  async queueOfflineMessage(userId: string, message: any): Promise<void> {
    try {
      const queueKey = `offline_queue:${userId}`
      const messageData = JSON.stringify({
        ...message,
        timestamp: Date.now(),
      })
      
      await redis.lpush(queueKey, messageData)
      await redis.expire(queueKey, 7 * 24 * 60 * 60) // 7 days TTL
      
      // Keep only last 100 messages
      await redis.getClient().ltrim(queueKey, 0, 99)
    } catch (error) {
      console.error('Error queuing offline message:', error)
    }
  }

  async getOfflineMessages(userId: string): Promise<any[]> {
    try {
      const queueKey = `offline_queue:${userId}`
      const messages = await redis.lrange(queueKey, 0, -1)
      
      // Clear the queue after retrieval
      await redis.del(queueKey)
      
      return messages.map(message => {
        try {
          return JSON.parse(message)
        } catch {
          return { message, timestamp: Date.now() }
        }
      })
    } catch (error) {
      console.error('Error getting offline messages:', error)
      return []
    }
  }
}

// Export singleton instance
export const realtimeService = RealtimeService.getInstance()
export default realtimeService 