import { redis, CacheKeys, CacheTTL } from './redis'
import { Candidate, User, Notification } from './types'

export class CacheService {
  // Candidate caching
  static async getCachedCandidate(id: string): Promise<Candidate | null> {
    try {
      return await redis.get<Candidate>(CacheKeys.candidate(id))
    } catch (error) {
      console.error('Error getting cached candidate:', error)
      return null
    }
  }

  static async setCachedCandidate(candidate: Candidate): Promise<void> {
    try {
      await redis.set(CacheKeys.candidate(candidate.id), candidate, CacheTTL.MEDIUM)
    } catch (error) {
      console.error('Error setting cached candidate:', error)
    }
  }

  static async getCachedCandidateList(userId: string): Promise<Candidate[] | null> {
    try {
      return await redis.get<Candidate[]>(CacheKeys.candidateList(userId))
    } catch (error) {
      console.error('Error getting cached candidate list:', error)
      return null
    }
  }

  static async setCachedCandidateList(userId: string, candidates: Candidate[]): Promise<void> {
    try {
      await redis.set(CacheKeys.candidateList(userId), candidates, CacheTTL.SHORT)
    } catch (error) {
      console.error('Error setting cached candidate list:', error)
    }
  }

  static async invalidateCandidateCache(candidateId: string, userId: string): Promise<void> {
    try {
      await Promise.all([
        redis.del(CacheKeys.candidate(candidateId)),
        redis.del(CacheKeys.candidateList(userId)),
        redis.del(CacheKeys.searchResults('*', userId)), // Clear search cache
      ])
    } catch (error) {
      console.error('Error invalidating candidate cache:', error)
    }
  }

  // User caching
  static async getCachedUser(userId: string): Promise<User | null> {
    try {
      return await redis.get<User>(CacheKeys.userProfile(userId))
    } catch (error) {
      console.error('Error getting cached user:', error)
      return null
    }
  }

  static async setCachedUser(user: User): Promise<void> {
    try {
      await redis.set(CacheKeys.userProfile(user.id), user, CacheTTL.LONG)
    } catch (error) {
      console.error('Error setting cached user:', error)
    }
  }

  // Notifications caching
  static async getCachedNotifications(userId: string): Promise<Notification[] | null> {
    try {
      return await redis.get<Notification[]>(CacheKeys.notifications(userId))
    } catch (error) {
      console.error('Error getting cached notifications:', error)
      return null
    }
  }

  static async setCachedNotifications(userId: string, notifications: Notification[]): Promise<void> {
    try {
      await redis.set(CacheKeys.notifications(userId), notifications, CacheTTL.SHORT)
    } catch (error) {
      console.error('Error setting cached notifications:', error)
    }
  }

  static async invalidateNotificationCache(userId: string): Promise<void> {
    try {
      await redis.del(CacheKeys.notifications(userId))
    } catch (error) {
      console.error('Error invalidating notification cache:', error)
    }
  }

  // Search results caching
  static async getCachedSearchResults(query: string, userId: string): Promise<Candidate[] | null> {
    try {
      const cacheKey = CacheKeys.searchResults(query.toLowerCase().trim(), userId)
      return await redis.get<Candidate[]>(cacheKey)
    } catch (error) {
      console.error('Error getting cached search results:', error)
      return null
    }
  }

  static async setCachedSearchResults(query: string, userId: string, results: Candidate[]): Promise<void> {
    try {
      const cacheKey = CacheKeys.searchResults(query.toLowerCase().trim(), userId)
      await redis.set(cacheKey, results, CacheTTL.SHORT)
    } catch (error) {
      console.error('Error setting cached search results:', error)
    }
  }

  // Session management
  static async setUserSession(userId: string, sessionData: any): Promise<void> {
    try {
      await redis.set(CacheKeys.userSessions(userId), sessionData, CacheTTL.DAY)
    } catch (error) {
      console.error('Error setting user session:', error)
    }
  }

  static async getUserSession(userId: string): Promise<any | null> {
    try {
      return await redis.get(CacheKeys.userSessions(userId))
    } catch (error) {
      console.error('Error getting user session:', error)
      return null
    }
  }

  static async clearUserSession(userId: string): Promise<void> {
    try {
      await redis.del(CacheKeys.userSessions(userId))
    } catch (error) {
      console.error('Error clearing user session:', error)
    }
  }

  // Recent activity tracking
  static async addRecentActivity(userId: string, activity: any): Promise<void> {
    try {
      if (!redis.isClientConnected()) return
      
      const activityKey = CacheKeys.recentActivity(userId)
      const activityData = JSON.stringify({
        ...activity,
        timestamp: Date.now(),
      })
      
      // Add to list and keep only last 50 activities
      await redis.lpush(activityKey, activityData)
      await redis.getClient().ltrim(activityKey, 0, 49)
      await redis.expire(activityKey, CacheTTL.WEEK)
    } catch (error) {
      console.error('Error adding recent activity:', error)
    }
  }

  static async getRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const activityKey = CacheKeys.recentActivity(userId)
      const activities = await redis.lrange(activityKey, 0, limit - 1)
      
      return activities.map(activity => {
        try {
          return JSON.parse(activity)
        } catch {
          return { activity, timestamp: Date.now() }
        }
      })
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }

  // Rate limiting
  static async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      if (!redis.isClientConnected()) return true // Allow on no connection
      
      const current = await redis.get<number>(`rate_limit:${key}`) || 0
      
      if (current >= limit) {
        return false // Rate limit exceeded
      }
      
      await redis.getClient().setex(`rate_limit:${key}`, windowSeconds, (current + 1).toString())
      return true // Within rate limit
    } catch (error) {
      console.error('Error checking rate limit:', error)
      return true // Allow on error
    }
  }

  // Batch operations
  static async batchSetCandidates(candidates: Candidate[]): Promise<void> {
    try {
      if (!redis.isClientConnected()) return
      
      const pipeline = redis.getClient().pipeline()
      
      candidates.forEach(candidate => {
        pipeline.set(CacheKeys.candidate(candidate.id), JSON.stringify(candidate), 'EX', CacheTTL.MEDIUM)
      })
      
      await pipeline.exec()
    } catch (error) {
      console.error('Error batch setting candidates:', error)
    }
  }

  static async batchGetCandidates(candidateIds: string[]): Promise<(Candidate | null)[]> {
    try {
      if (!redis.isClientConnected()) {
        return candidateIds.map(() => null)
      }
      
      const pipeline = redis.getClient().pipeline()
      
      candidateIds.forEach(id => {
        pipeline.get(CacheKeys.candidate(id))
      })
      
      const results = await pipeline.exec()
      
      return results?.map(([err, value]) => {
        if (err || !value) return null
        try {
          return JSON.parse(value as string) as Candidate
        } catch {
          return null
        }
      }) || []
    } catch (error) {
      console.error('Error batch getting candidates:', error)
      return candidateIds.map(() => null)
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      // Check if Redis client is connected
      if (!redis.isClientConnected()) {
        return false
      }
      
      const testKey = 'health_check'
      const testValue = Date.now().toString()
      
      await redis.set(testKey, testValue, 10) // 10 seconds TTL
      const retrieved = await redis.get(testKey)
      await redis.del(testKey)
      
      return retrieved === testValue
    } catch (error) {
      console.error('Redis health check failed:', error)
      return false
    }
  }

  // Clear all cache for a user (useful for debugging/testing)
  static async clearUserCache(userId: string): Promise<void> {
    try {
      const keysToDelete = [
        CacheKeys.userProfile(userId),
        CacheKeys.candidateList(userId),
        CacheKeys.notifications(userId),
        CacheKeys.userSessions(userId),
        CacheKeys.recentActivity(userId),
      ]
      
      await Promise.all(keysToDelete.map(key => redis.del(key)))
    } catch (error) {
      console.error('Error clearing user cache:', error)
    }
  }
}

export default CacheService 