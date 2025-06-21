import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore'
import { firestore } from './firebase'
import { createMentionNotification, findUsersByQuery } from './firebase-services'

// Message/Note interface
export interface Message {
  id: string
  candidateId: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  mentions: string[] // Array of mentioned user IDs
}

const messagesCollection = collection(firestore, 'messages')

export const messagingService = {
  // Send a message/note about a candidate
  async sendMessage(messageData: {
    candidateId: string
    content: string
    senderId: string
    senderName: string
    candidateName: string
  }) {
    // Parse mentions from content (@username format)
    const mentions = this.parseMentions(messageData.content)
    
    // Create the message with current timestamp to avoid serverTimestamp issues
    const currentTime = new Date()
    const docRef = await addDoc(messagesCollection, {
      candidateId: messageData.candidateId,
      content: messageData.content,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      mentions,
      timestamp: currentTime,
      createdAt: serverTimestamp() // Keep server timestamp for server-side operations
    })

    // Create notifications for mentioned users
    if (mentions.length > 0) {
      await this.createMentionNotifications(
        mentions,
        messageData.candidateId,
        messageData.candidateName,
        messageData.senderId,
        messageData.senderName,
        messageData.content
      )
    }

    return docRef.id
  },

  // Parse @mentions from message content - improved to handle any username format
  parseMentions(content: string): string[] {
    // Find all @mentions - matches @word or @"multiple words" or @word_name
    const mentionRegex = /@([a-zA-Z0-9_\s]+)(?=\s|$|[.,!?])/gi
    const matches = content.match(mentionRegex)
    
    if (!matches) {
      return []
    }
    
    // Extract usernames without @ symbol and clean them
    const usernames = matches.map(match => {
      const username = match.substring(1).trim()
      return username
    })
    
    return usernames
  },

  // Create mention notifications for all mentioned users - improved matching
  async createMentionNotifications(
    mentions: string[],
    candidateId: string,
    candidateName: string,
    fromUserId: string,
    fromUserName: string,
    messageContent: string
  ) {
    try {
      // Get all users first for better matching
      const allUsers = await findUsersByQuery()
      
      // Find all users that match the mentioned names
      for (const mentionedName of mentions) {
        // Find users by flexible matching (name or email, case insensitive, partial match)
        const matchingUsers = allUsers.filter(user => {
          const nameMatch = user.name.toLowerCase().includes(mentionedName.toLowerCase())
          const emailMatch = user.email.toLowerCase().includes(mentionedName.toLowerCase())
          const exactNameMatch = user.name.toLowerCase() === mentionedName.toLowerCase()
          const partialNameMatch = mentionedName.toLowerCase().includes(user.name.toLowerCase())
          
          return exactNameMatch || nameMatch || emailMatch || partialNameMatch
        })
        
        // Create notification for each matching user (but not the sender)
        for (const user of matchingUsers) {
          if (user.id !== fromUserId) {
            await createMentionNotification(
              user.id,
              candidateId,
              candidateName,
              fromUserId,
              fromUserName,
              messageContent
            )
          }
        }
      }
    } catch (error) {
      console.error('Error creating mention notifications:', error)
    }
  },

  // Get messages for a candidate
  async getMessagesForCandidate(candidateId: string) {
    const q = query(
      messagesCollection,
      where('candidateId', '==', candidateId),
      limit(100)
    )

    const snapshot = await getDocs(q)
    const messages = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date()
      }
    }) as Message[]

    // Sort manually by timestamp
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    return messages
  },

  // Real-time subscription to messages for a candidate
  subscribeToMessages(candidateId: string, callback: (messages: Message[]) => void) {
    const q = query(
      messagesCollection,
      where('candidateId', '==', candidateId),
      limit(100)
    )

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        }
      }) as Message[]
      
      // Sort manually by timestamp
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      
      callback(messages)
    }, (error) => {
      console.error('Message subscription error:', error)
      // Call callback with empty array on error so UI doesn't stay in loading state
      callback([])
    })
  }
}

export default messagingService 