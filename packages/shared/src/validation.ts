import { z } from 'zod'

// Auth schemas
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Candidate schemas
export const createCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

export const updateCandidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
})

// Message schemas
export const createMessageSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  content: z.string().min(1, 'Message content is required'),
})

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
})

// Notification schemas
export const markNotificationReadSchema = z.object({
  read: z.boolean(),
})

// Query schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export const candidateQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
})

export const messageQuerySchema = paginationSchema.extend({
  candidateId: z.string().min(1, 'Candidate ID is required'),
})

export const notificationQuerySchema = paginationSchema.extend({
  unreadOnly: z.coerce.boolean().default(false),
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>
export type CreateMessageInput = z.infer<typeof createMessageSchema>
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type CandidateQueryInput = z.infer<typeof candidateQuerySchema>
export type MessageQueryInput = z.infer<typeof messageQuerySchema>
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema> 