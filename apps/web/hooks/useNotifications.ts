'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, where } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useToast } from '@/hooks/useToast'

export interface Notification {
  id: string
  message: string
  type: 'mention' | 'note' | 'candidate' | 'system'
  read: boolean
  timestamp: any
  userId: string
  candidateId?: string
  fromUser?: string
  fromUserName?: string
}

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
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Create a pleasant notification sound (C5 -> E5 -> G5)
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    let startTime = audioContext.currentTime
    
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

export const useNotifications = () => {
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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationQueryKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return []
      
      const notificationsRef = collection(firestore, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', user.id),
        orderBy('timestamp', 'desc')
      )
      
      return new Promise<Notification[]>((resolve, reject) => {
        let isResolved = false
        
        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const notificationsList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Notification[]
            
            // Check if we have new notifications and play sound (only after initial load)
            const currentCount = notificationsList.length
            const unreadCount = notificationsList.filter(n => !n.read).length
            
            if (isResolved && currentCount > lastNotificationCountRef.current && lastNotificationCountRef.current >= 0) {
              // Play notification sound for new notifications
              if (soundRef.current && unreadCount > 0) {
                try {
                  soundRef.current()
                } catch (error) {
                  console.log('Could not play notification sound:', error)
                }
              }
              
              // Show toast for new notifications
              const newNotifications = notificationsList.slice(0, currentCount - lastNotificationCountRef.current)
              newNotifications.forEach(notification => {
                if (!notification.read) {
                  toast({
                    title: "New Notification",
                    description: notification.message,
                    variant: "default",
                  })
                }
              })
            }
            
            lastNotificationCountRef.current = currentCount
            
            if (!isResolved) {
              isResolved = true
              resolve(notificationsList)
            }
            
            // Update the query cache with new data
            queryClient.setQueryData(notificationQueryKeys.list(user?.id || ''), notificationsList)
          },
          (error) => {
            if (!isResolved) {
              reject(error)
            }
          }
        )
        
        // Return cleanup function
        return () => unsubscribe()
      })
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // 5 minutes
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const notificationRef = doc(firestore, 'notifications', notificationId)
      await updateDoc(notificationRef, { read: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(user?.id || '') })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.read)
      const promises = unreadNotifications.map(notification => {
        const notificationRef = doc(firestore, 'notifications', notification.id)
        return updateDoc(notificationRef, { read: true })
      })
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(user?.id || '') })
    }
  })

  const addNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const notificationsRef = collection(firestore, 'notifications')
      await addDoc(notificationsRef, {
        ...notification,
        timestamp: new Date()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
    }
  })

  // Demo function to create test notifications
  const createDemoNotifications = async () => {
    if (!user?.id) return
    
    const demoNotifications = [
      {
        message: "🎉 Welcome to AlgoHire! Your notification system is working perfectly.",
        type: 'system' as const,
        read: false,
        userId: user.id,
        fromUser: 'system',
        fromUserName: 'AlgoHire'
      },
      {
        message: "👋 You were mentioned in a note about Sarah Johnson",
        type: 'mention' as const,
        read: false,
        userId: user.id,
        candidateId: 'demo-1',
        candidateName: 'Sarah Johnson',
        fromUser: 'demo-user',
        fromUserName: 'Demo Recruiter'
      },
      {
        message: "💬 New note added for candidate Mike Chen",
        type: 'note' as const,
        read: false,
        userId: user.id,
        candidateId: 'demo-2',
        candidateName: 'Mike Chen',
        fromUser: 'demo-user-2',
        fromUserName: 'Jane Smith'
      }
    ]

    try {
      for (const notification of demoNotifications) {
        await addDoc(collection(firestore, 'notifications'), {
          ...notification,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('Failed to create demo notifications:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    addNotification: addNotificationMutation.mutate,
    createDemoNotifications,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending
  }
} 