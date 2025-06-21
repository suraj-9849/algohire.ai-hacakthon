import { NextRequest, NextResponse } from 'next/server'
import CacheService from '@/lib/cache-service'
import { redis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    // Perform Redis health check
    const isHealthy = await CacheService.healthCheck()
    const isConnected = redis.isClientConnected()
    
    if (!isHealthy || !isConnected) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          redis: {
            connected: isConnected,
            healthCheck: isHealthy
          },
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Get Redis info if connected
    let redisInfo = {}
    try {
      const info = await redis.getClient().info('memory')
      const serverInfo = await redis.getClient().info('server')
      
      redisInfo = {
        connected: isConnected,
        healthCheck: isHealthy,
        memory: info.split('\n').filter(line => line.includes('used_memory_human'))[0],
        version: serverInfo.split('\n').filter(line => line.includes('redis_version'))[0],
        uptime: serverInfo.split('\n').filter(line => line.includes('uptime_in_seconds'))[0]
      }
    } catch (error) {
      console.error('Error getting Redis info:', error)
    }

    return NextResponse.json({
      status: 'healthy',
      redis: redisInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Redis health check error:', error)
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Redis health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 