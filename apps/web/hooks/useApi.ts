import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatesAPI, messagesAPI, notificationsAPI, authAPI } from '@/lib/api'
import { useToast } from './useToast'

// Auth hooks
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authAPI.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update profile',
        variant: 'destructive',
      })
    },
  })
}

// Candidates hooks
export const useCandidates = (params: { page?: number; limit?: number; search?: string } = {}) => {
  return useQuery({
    queryKey: ['candidates', params],
    queryFn: () => candidatesAPI.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateCandidate = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: candidatesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast({
        title: 'Success',
        description: 'Candidate created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create candidate',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; email?: string } }) =>
      candidatesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] })
      toast({
        title: 'Success',
        description: 'Candidate updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update candidate',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: candidatesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      toast({
        title: 'Success',
        description: 'Candidate deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete candidate',
        variant: 'destructive',
      })
    },
  })
}

// Messages hooks
export const useMessages = (candidateId: string, params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['messages', candidateId, params],
    queryFn: () => messagesAPI.getAll({ candidateId, ...params }),
    enabled: !!candidateId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: messagesAPI.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.candidateId] })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send message',
        variant: 'destructive',
      })
    },
  })
}

// Notifications hooks
export const useNotifications = (params: { page?: number; limit?: number; unreadOnly?: boolean } = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsAPI.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsAPI.getUnreadCount,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, read }: { id: string; read?: boolean }) =>
      notificationsAPI.markAsRead(id, read),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: notificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to mark notifications as read',
        variant: 'destructive',
      })
    },
  })
} 