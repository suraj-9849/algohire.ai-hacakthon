'use client'

import { Bell, MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { Candidate } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface NotificationsListProps {
  onNotificationClick: (candidate: Candidate) => void
}

export function NotificationsList({ onNotificationClick }: NotificationsListProps): JSX.Element {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead
  } = useNotifications()

  // Debug logging
  console.log('Notifications in component:', notifications)

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Create candidate object from notification
    const candidate: Candidate = {
      id: notification.candidateId || 'unknown',
      name: notification.candidateName || 'Unknown Candidate',
      email: '',
      position: '',
      phone: '',
      location: '',
      createdAt: new Date(),
      createdBy: notification.fromUser || 'Unknown'
    }

    onNotificationClick(candidate)
  }

  if (isLoading) {
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
        <p className="text-gray-500">You'll see mentions and updates here when someone tags you or adds notes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-black">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            className="h-7 px-2 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        </div>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${!notification.read
              ? 'bg-blue-50 border-blue-200 shadow-sm'
              : 'border-gray-200 bg-white'
            }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                <MessageSquare className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'
                  }`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                  {notification.type === 'mention' && '📝 Mention'}
                  {notification.type === 'note' && '💬 New Note'}
                  {notification.type === 'candidate' && '👤 New Candidate'}
                  {notification.type === 'system' && '🔔 System'}
                  {(notification as any).candidateName && ` - ${(notification as any).candidateName}`}
                </p>
                {!notification.read && (
                  <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></div>
                )}
              </div>
              <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'
                }`}>
                {notification.message || (notification as any).content || 'No message content'}
              </p>
              {notification.fromUserName && (
                <p className="text-xs text-gray-500 mt-1">
                  From: <span className="font-medium">{notification.fromUserName}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {(() => {
                  try {
                    if (notification.timestamp?.toDate) {
                      return notification.timestamp.toDate().toLocaleString()
                    } else if (notification.timestamp) {
                      return new Date(notification.timestamp).toLocaleString()
                    } else {
                      return 'Unknown time'
                    }
                  } catch (error) {
                    return 'Invalid date'
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 