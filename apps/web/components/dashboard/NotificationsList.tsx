'use client'

import { Bell, MessageSquare, Check, X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { Candidate } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'

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

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    markAsRead(notificationId)
  }

  const getTimeAgo = (timestamp: any) => {
    try {
      let date: Date
      if (timestamp?.toDate) {
        date = timestamp.toDate()
      } else if (timestamp) {
        date = new Date(timestamp)
      } else {
        return 'Unknown time'
      }

      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        return `${diffDays}d ago`
      } else if (diffHours > 0) {
        return `${diffHours}h ago`
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return diffMins > 0 ? `${diffMins}m ago` : 'Just now'
      }
    } catch (error) {
      return 'Invalid date'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] lg:min-h-[300px] p-8">
        <div className="text-center">
          <Bell className="h-12 w-12 lg:h-16 lg:w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 text-sm max-w-sm">You'll see mentions and updates here when someone tags you or adds notes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with unread count and mark all read button */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between p-4 pb-2 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {unreadCount} unread
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            className="h-8 px-3 text-xs hover:bg-gray-50"
          >
            {isMarkingAllAsRead ? (
              <LoadingSpinner size="sm" className="mr-1" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Mark all read
          </Button>
        </div>
      )}

      {/* Scrollable notifications container */}
      <div className="flex-1 overflow-y-auto space-y-1 p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {notifications.map((notification, index) => (
                      <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`relative group p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                !notification.read
                  ? 'bg-blue-50 border-blue-200 shadow-sm hover:bg-blue-100'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
            {/* Unread indicator */}
            {!notification.read && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}

            {/* Mark as read button for unread notifications */}
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleMarkAsRead(e, notification.id)}
                className="absolute top-2 right-6 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {notification.type === 'mention' && (
                    <MessageSquare className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  {notification.type === 'note' && (
                    <MessageSquare className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  {notification.type === 'candidate' && (
                    <Users className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  {notification.type === 'system' && (
                    <Bell className={`h-4 w-4 ${!notification.read ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                </div>
              </div>

                             {/* Content */}
               <div className="flex-1 min-w-0 pr-3">
                 {/* Title */}
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`text-sm font-medium ${
                     !notification.read ? 'text-gray-900' : 'text-gray-700'
                   }`}>
                     {notification.type === 'mention' && '📝 You were mentioned'}
                     {notification.type === 'note' && '💬 New note added'}
                     {notification.type === 'candidate' && '👤 New candidate'}
                     {notification.type === 'system' && '🔔 System notification'}
                   </span>
                 </div>

                 {/* Candidate name if available */}
                 {(notification as any).candidateName && (
                   <p className={`text-sm font-medium mb-1 ${
                     !notification.read ? 'text-gray-800' : 'text-gray-600'
                   }`}>
                     in {(notification as any).candidateName}'s profile
                   </p>
                 )}

                 {/* Message content */}
                 <p className={`text-sm mb-1 line-clamp-2 ${
                   !notification.read ? 'text-gray-700' : 'text-gray-500'
                 }`}>
                   {notification.message || (notification as any).content || 'No message content'}
                 </p>

                 {/* Footer with sender and time */}
                 <div className="flex items-center justify-between text-xs text-gray-400">
                   {notification.fromUserName && (
                     <span>
                       From <span className="font-medium text-gray-500">{notification.fromUserName}</span>
                     </span>
                   )}
                   <span>{getTimeAgo(notification.timestamp)}</span>
                 </div>
               </div>
            </div>
          </div>
                 ))}
       </div>
     </div>
  )
} 