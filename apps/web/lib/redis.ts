import Redis from 'ioredis'

interface RedisConfig {
  host: string
  port: number
  password?: string
  db: number
  retryDelayOnFailover: number
  maxRetriesPerRequest: number
  lazyConnect: boolean
}

// Redis configuration
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
}

// Create Redis client instance
class RedisClient {
  private static instance: RedisClient
  private client: Redis
  private isConnected: boolean = false

  private constructor() {
    this.client = new Redis(redisConfig)
    this.setupEventHandlers()
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log(' Redis connected successfully')
      this.isConnected = true
    })

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err)
      this.isConnected = false
    })

    this.client.on('close', () => {
      console.log(' Redis connection closed')
      this.isConnected = false
    })

    this.client.on('reconnecting', () => {
      console.log(' Redis reconnecting...')
    })
  }

  public getClient(): Redis {
    return this.client
  }

  public isClientConnected(): boolean {
    return this.isConnected
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect()
  }

  // Cache utility methods
  public async set(
    key: string, 
    value: string | object, 
    ttlSeconds?: number
  ): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }
    } catch (error) {
      console.error('Redis SET error:', error)
      throw error
    }
  }

  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      if (!value) return null
      
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      console.error('Redis GET error:', error)
      throw error
    }
  }

  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key)
    } catch (error) {
      console.error('Redis DEL error:', error)
      throw error
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      throw error
    }
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds)
      return result === 1
    } catch (error) {
      console.error('Redis EXPIRE error:', error)
      throw error
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key)
    } catch (error) {
      console.error('Redis TTL error:', error)
      throw error
    }
  }

  // List operations for queues/notifications
  public async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values)
    } catch (error) {
      console.error('Redis LPUSH error:', error)
      throw error
    }
  }

  public async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key)
    } catch (error) {
      console.error('Redis RPOP error:', error)
      throw error
    }
  }

  public async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop)
    } catch (error) {
      console.error('Redis LRANGE error:', error)
      throw error
    }
  }

  // Hash operations for structured data
  public async hset(key: string, field: string, value: string | object): Promise<number> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
      return await this.client.hset(key, field, serializedValue)
    } catch (error) {
      console.error('Redis HSET error:', error)
      throw error
    }
  }

  public async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field)
      if (!value) return null
      
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      console.error('Redis HGET error:', error)
      throw error
    }
  }

  public async hgetall<T = Record<string, any>>(key: string): Promise<T | null> {
    try {
      const hash = await this.client.hgetall(key)
      if (!Object.keys(hash).length) return null
      
      const parsed: Record<string, any> = {}
      for (const [field, value] of Object.entries(hash)) {
        try {
          parsed[field] = JSON.parse(value)
        } catch {
          parsed[field] = value
        }
      }
      return parsed as T
    } catch (error) {
      console.error('Redis HGETALL error:', error)
      throw error
    }
  }

  public async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.client.hdel(key, ...fields)
    } catch (error) {
      console.error('Redis HDEL error:', error)
      throw error
    }
  }

  // Set operations for unique collections
  public async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members)
    } catch (error) {
      console.error('Redis SADD error:', error)
      throw error
    }
  }

  public async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key)
    } catch (error) {
      console.error('Redis SMEMBERS error:', error)
      throw error
    }
  }

  public async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, ...members)
    } catch (error) {
      console.error('Redis SREM error:', error)
      throw error
    }
  }

  public async publish(channel: string, message: string | object): Promise<number> {
    try {
      const serializedMessage = typeof message === 'string' ? message : JSON.stringify(message)
      return await this.client.publish(channel, serializedMessage)
    } catch (error) {
      console.error('Redis PUBLISH error:', error)
      throw error
    }
  }

  public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      const subscriber = new Redis(redisConfig)
      await subscriber.subscribe(channel)
      subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message)
        }
      })
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error)
      throw error
    }
  }
}

export const redis = RedisClient.getInstance()
export default redis

export const CacheKeys = {
  candidate: (id: string) => `candidate:${id}`,
  candidateList: (userId: string) => `candidates:user:${userId}`,
  userSessions: (userId: string) => `sessions:user:${userId}`,
  notifications: (userId: string) => `notifications:user:${userId}`,
  searchResults: (query: string, userId: string) => `search:${userId}:${query}`,
  userProfile: (userId: string) => `user:${userId}`,
  recentActivity: (userId: string) => `activity:user:${userId}`,
} as const

export const CacheTTL = {
  SHORT: 5 * 60,
  MEDIUM: 30 * 60,
  LONG: 2 * 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60, 
} as const 