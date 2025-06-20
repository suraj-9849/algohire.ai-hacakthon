export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Candidate {
  id: string
  name: string
  email: string
  position: string
  phone?: string
  location?: string
  createdAt: Date
  createdBy: string
  status?: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected'
}

export interface Message {
  id: string
  candidateId: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  mentions: string[]
}

export interface Notification {
  id: string
  userId: string
  messageId: string
  candidateId: string
  candidateName: string
  content: string
  senderName: string
  timestamp: Date
  read: boolean
} 