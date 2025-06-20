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
  createdAt: Date
  createdBy: string
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

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
} 