'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore'
import { Bell, MessageSquare } from 'lucide-react'
import { firestore } from '@/lib/firebase'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Notification, Candidate } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface NotificationsListProps {
  onNotificationClick: (candidate: Candidate) => void
}

export function NotificationsList({ onNotificationClick }: NotificationsListProps): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user) {
      console.log('❌ No user found, cannot fetch notifications')
      setLoading(false)
      return
    }

    console.log('🔍 Fetching notifications for user ID:', user.id)
    console.log('👤 Current user:', { id: user.id, name: user.name, email: user.email })

    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.id),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📬 Notification snapshot received, docs count:', snapshot.docs.length)
      
      const notificationsList = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log('📧 Notification doc:', { id: doc.id, ...data })
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        }
      }) as Notification[]
      
      console.log('📋 Final notifications list:', notificationsList)
      setNotifications(notificationsList)
      setLoading(false)
    }, (error) => {
      console.error('❌ Error fetching notifications:', error)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await updateDoc(doc(firestore, 'notifications', notification.id), {
        read: true
      })
    }

    // Create a candidate object to pass to the handler
    const candidate: Candidate = {
      id: notification.candidateId,
      name: notification.candidateName,
      email: '', // We don't have email in notification, but it's required for type
      createdAt: new Date(),
      createdBy: ''
    }

    onNotificationClick(candidate)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p className="text-gray-500">You'll see mentions here when someone tags you in a message.</p>
        
        {/* Debug info */}
        {user && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {user.id}</p>
            <p>User Name: {user.name}</p>
            <p>User Email: {user.email}</p>
            <button 
              onClick={async () => {
                console.log('🔍 Manually checking notifications in Firestore...')
                try {
                  const allNotifications = await getDocs(collection(firestore, 'notifications'))
                  console.log('📊 All notifications in database:')
                  allNotifications.docs.forEach(doc => {
                    console.log('📧', doc.id, ':', doc.data())
                  })
                } catch (error) {
                  console.error('❌ Error fetching all notifications:', error)
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
            >
              🔍 Debug Check
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <div className="text-sm font-medium text-primary mb-4">
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </div>
      )}
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
            !notification.read ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <MessageSquare className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.candidateName}
                </p>
                {!notification.read && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                <span className="font-medium">{notification.senderName}</span> mentioned you
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                "{notification.content}"
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {notification.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 