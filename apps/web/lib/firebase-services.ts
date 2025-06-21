import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { firestore } from './firebase'
import { Candidate, Notification, User } from './types'

// Utility function to clean data for Firestore
const cleanFirestoreData = (data: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  )
}

// Collection reference getters (lazy initialization)
const getCandidatesCollection = () => {
  if (!firestore) {
    throw new Error('Firestore not initialized')
  }
  return collection(firestore, 'candidates')
}

const getNotificationsCollection = () => {
  if (!firestore) {
    throw new Error('Firestore not initialized')
  }
  return collection(firestore, 'notifications')
}

const getUsersCollection = () => {
  if (!firestore) {
    throw new Error('Firestore not initialized')
  }
  return collection(firestore, 'users')
}

// Candidate Services
export const candidatesService = {
  // Add a new candidate
  async addCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt'>) {
    if (!firestore) {
      throw new Error('Firebase not initialized')
    }
    
    const cleanData = cleanFirestoreData(candidateData)
    
    const docRef = await addDoc(getCandidatesCollection(), {
      ...cleanData,
      createdAt: serverTimestamp(),
      status: candidateData.status || 'pending'
    })
    
    // Real-time updates handled by Firebase onSnapshot subscriptions
    
    return docRef.id
  },

  // Get ALL candidates (collaborative platform - all users see all candidates)
  async getCandidates(userId: string, searchQuery: string = '') {
    if (!firestore) {
      return []
    }
    
    // Fetch from Firestore directly (caching handled by React Query)
    const snapshot = await getDocs(getCandidatesCollection())
    
    const candidates = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      }
    }) as Candidate[]

    // Sort manually by createdAt descending
    candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Filter by search query if provided
    if (searchQuery) {
      const filteredCandidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.position && candidate.position.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      return filteredCandidates
    }

    return candidates
  },

  // Real-time subscription to ALL candidates (collaborative platform)
  subscribeToAllCandidates(callback: (candidates: Candidate[]) => void) {
    if (!firestore) {
      callback([])
      return () => {} // Return empty unsubscribe function
    }
    
    return onSnapshot(getCandidatesCollection(), (snapshot) => {
      const candidates = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        }
      }) as Candidate[]
      
      // Sort manually by createdAt descending
      candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      callback(candidates)
    }, (error) => {
      console.error('Firestore subscription error:', error)
    })
  },

  // Update a candidate
  async updateCandidate(candidateId: string, updateData: Partial<Candidate>) {
    const cleanData = cleanFirestoreData(updateData)
    const docRef = doc(getCandidatesCollection(), candidateId)
    await updateDoc(docRef, cleanData)
  },

  // Delete a candidate
  async deleteCandidate(candidateId: string) {
    const docRef = doc(getCandidatesCollection(), candidateId)
    await deleteDoc(docRef)
  },

  // Get a single candidate
  async getCandidate(candidateId: string) {
    const docRef = doc(getCandidatesCollection(), candidateId)
    const snapshot = await getDoc(docRef)
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
        createdAt: snapshot.data().createdAt?.toDate() || new Date()
      } as Candidate
    }
    
    throw new Error('Candidate not found')
  }
}

// Notification Services
export const notificationsService = {
  // Create a notification
  async createNotification(notificationData: Partial<Notification>) {
    if (!firestore) {
      throw new Error('Firebase not initialized')
    }
    
    const cleanData = cleanFirestoreData(notificationData)
    
    const docRef = await addDoc(getNotificationsCollection(), {
      ...cleanData,
      timestamp: serverTimestamp(),
      read: false
    })
    
    // Publish real-time notification
    if (notificationData.userId) {
      const notification: Notification = {
        id: docRef.id,
        timestamp: new Date(),
        read: false,
        ...notificationData
      } as Notification
    }
    
    return docRef.id
  },

  // Get notifications for a user
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    if (!firestore) {
      return []
    }

    let q = query(
      getNotificationsCollection(),
      where('userId', '==', userId),
      limit(50)
    )

    if (unreadOnly) {
      q = query(
        getNotificationsCollection(),
        where('userId', '==', userId),
        where('read', '==', false),
        limit(50)
      )
    }

    const snapshot = await getDocs(q)
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as Notification[]

    // Sort manually by timestamp descending
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    return notifications
  },

  // Real-time subscription to user notifications
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    if (!firestore) {
      callback([])
      return () => {} // Return empty unsubscribe function
    }
    
    const q = query(
      getNotificationsCollection(),
      where('userId', '==', userId),
      limit(50)
    )

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Notification[]
      
      // Sort manually by timestamp descending
      notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      callback(notifications)
    }, (error) => {
      console.error('Notification subscription error:', error)
    })
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    const docRef = doc(getNotificationsCollection(), notificationId)
    await updateDoc(docRef, { read: true })
  },

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string) {
    const q = query(
      getNotificationsCollection(),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    const batch = writeBatch(firestore)
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true })
    })
    await batch.commit()
  },

  // Get unread notification count
  async getUnreadCount(userId: string) {
    const q = query(
      getNotificationsCollection(),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.size
  }
}

// Helper functions for creating notifications
export const createMentionNotification = async (
  mentionedUserId: string,
  candidateId: string,
  candidateName: string,
  fromUserId: string,
  fromUserName: string,
  messageContent: string
) => {
  try {
    const notificationData = {
      message: `${fromUserName} mentioned you in a note about ${candidateName}`,
      type: 'mention' as const,
      userId: mentionedUserId,
      candidateId,
      candidateName,
      fromUser: fromUserId,
      fromUserName,
      content: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent
    }
    
    const notificationId = await notificationsService.createNotification(notificationData)
    return notificationId
  } catch (error) {
    console.error('Error creating mention notification:', error)
    throw error
  }
}

export const createCandidateNotification = async (
  userId: string,
  candidateName: string,
  action: string
) => {
  await notificationsService.createNotification({
    message: `${action}: ${candidateName}`,
    type: 'candidate' as const,
    userId,
    candidateId: 'candidate-update',
    candidateName,
    content: `Candidate ${candidateName} has been ${action.toLowerCase()}`
  })
}

// Create candidate notifications for ALL users (collaborative platform)
export const createCandidateNotificationForAllUsers = async (
  candidateName: string,
  creatorName: string,
  action: string
) => {
  try {
    // Get all users
    const allUsers = await usersService.getAllUsers()
    
    // Create notification for each user
    for (const user of allUsers) {
      await notificationsService.createNotification({
        message: `New candidate ${action} by ${creatorName}: ${candidateName}`,
        type: 'candidate' as const,
        userId: user.id,
        candidateId: 'candidate-creation',
        candidateName,
        fromUserName: creatorName,
        content: `${creatorName} ${action} candidate ${candidateName}`
      })
    }
  } catch (error) {
    console.error('Error notifying all users:', error)
  }
}

// User Services
export const usersService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(getUsersCollection())
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as User[]
    
    return users
  },

  // Create or update user
  async createUser(userId: string, userData: { name: string; email: string }) {
    await setDoc(doc(getUsersCollection(), userId), {
      ...userData,
      createdAt: new Date()
    })
  }
}

// Function to find users by name/email for mentions
export const findUsersByQuery = async (searchQuery: string = ''): Promise<User[]> => {
  // Get all users first
  const users = await usersService.getAllUsers()
  
  if (!searchQuery) {
    return users
  }
  
  // Filter users by name or email
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return filteredUsers
} 