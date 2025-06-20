import axios from 'axios'
import { auth } from './firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: { data: any }) => response.data,
  (error: { response: { data: any }; message: any }) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || error)
  }
)

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  
  signin: (data: { email: string; password: string }) =>
    api.post('/auth/signin', data),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: { name: string }) =>
    api.put('/auth/profile', data),
  
  verifyToken: () =>
    api.get('/auth/verify'),
}

// Candidates API
export const candidatesAPI = {
  getAll: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api.get('/candidates', { params }),
  
  getById: (id: string) =>
    api.get(`/candidates/${id}`),
  
  create: (data: { name: string; email: string }) =>
    api.post('/candidates', data),
  
  update: (id: string, data: { name?: string; email?: string }) =>
    api.put(`/candidates/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/candidates/${id}`),
}

// Messages API
export const messagesAPI = {
  getAll: (params: { candidateId: string; page?: number; limit?: number }) =>
    api.get('/messages', { params }),
  
  create: (data: { candidateId: string; content: string }) =>
    api.post('/messages', data),
}

// Notifications API
export const notificationsAPI = {
  getAll: (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id: string, read: boolean = true) =>
    api.patch(`/notifications/${id}`, { read }),
  
  markAllAsRead: () =>
    api.patch('/notifications'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
}

export default api 