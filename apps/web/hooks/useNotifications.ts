'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { notificationsService } from '@/lib/firebase-services' 
import { Notification } from '@/lib/types'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useToast } from '@/hooks/useToast'
import CacheService from '@/lib/cache-service'

const notificationQueryKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...notificationQueryKeys.lists(), userId] as const,
  unread: (userId: string) => [...notificationQueryKeys.all, 'unread', userId] as const,
}

// Create notification sound
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  
  const playNotificationSound = () => {
    // Create a simple pleasant notification sound
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    const startTime = audioContext.currentTime
    
    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()
      
      osc.connect(gain)
      gain.connect(audioContext.destination)
      
      osc.frequency.setValueAtTime(freq, startTime + index * 0.15)
      osc.type = 'sine'
      
      // Smooth volume envelope
      gain.gain.setValueAtTime(0, startTime + index * 0.15)
      gain.gain.linearRampToValueAtTime(0.1, startTime + index * 0.15 + 0.05)
      gain.gain.linearRampToValueAtTime(0, startTime + index * 0.15 + 0.1)
      
      osc.start(startTime + index * 0.15)
      osc.stop(startTime + index * 0.15 + 0.1)
    })
  }
  
  return playNotificationSound
}

export const useNotifications = (unreadOnly = false) => {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const soundRef = useRef<(() => void) | null>(null)
  const lastNotificationCountRef = useRef<number>(0)

  // Initialize sound on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      soundRef.current = createNotificationSound()
    }
  }, [])

  // Firebase real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = notificationsService.subscribeToUserNotifications(
      user.id,
      (notifications) => {
        // Update the query cache with real-time data
        queryClient.setQueryData(
          notificationQueryKeys.list(user.id),
          notifications
        )

        // Play notification sound for new notifications
        if (notifications.length > lastNotificationCountRef.current && soundRef.current) {
          soundRef.current()
        }
        lastNotificationCountRef.current = notifications.length

        // Update unread count
        const unreadCount = notifications.filter(n => !n.read).length
        queryClient.setQueryData(
          notificationQueryKeys.unread(user.id),
          { unreadCount }
        )

        // Force refetch to ensure data is fresh
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(user.id) })
      }
    )

    return unsubscribe
  }, [user?.id, queryClient])

  // Fetch notifications using Redis cache + Firebase fallback
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationQueryKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return []
      
      // Try Redis cache first (only for full notifications, not unread-only)
      if (!unreadOnly) {
        const cachedNotifications = await CacheService.getCachedNotifications(user.id)
        if (cachedNotifications) return cachedNotifications
      }
      
      // Fallback to Firebase if cache miss
      return notificationsService.getUserNotifications(user.id, unreadOnly)
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 1000,
  })

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: notificationQueryKeys.unread(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return { unreadCount: 0 }
      const unreadCount = await notificationsService.getUnreadCount(user.id)
      return { unreadCount }
    },
    enabled: !!user?.id,
    staleTime: 10 * 1000, // 10 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
  })

  const unreadCount = unreadCountData?.unreadCount || 0

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await notificationsService.markNotificationAsRead(notificationId)
    },
    onSuccess: () => {
      toast({
        title: 'Marked as read',
        description: 'Notification has been marked as read',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark notification as read',
        variant: 'destructive',
      })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      await notificationsService.markAllNotificationsAsRead(user.id)
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
        variant: 'default',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark all notifications as read',
        variant: 'destructive',
      })
    },
  })

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
} 