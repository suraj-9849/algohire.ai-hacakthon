import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { candidatesService, createCandidateNotification, createCandidateNotificationForAllUsers } from '@/lib/firebase-services'
import { Candidate } from '@/lib/types'
import { toast } from '@/hooks/useToast'
import { useAuthContext } from '@/components/providers/AuthProvider'

// Query Keys
export const candidatesKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidatesKeys.all, 'list'] as const,
  list: (userId: string, search: string = '') => [...candidatesKeys.lists(), { userId, search }] as const,
  details: () => [...candidatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidatesKeys.details(), id] as const,
}

// Main candidates hook with Firebase real-time updates
export function useCandidates(search: string = '') {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()

  // Firebase real-time subscription to ALL candidates
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = candidatesService.subscribeToAllCandidates(
      (candidates) => {
        // Filter candidates based on search
        const filteredCandidates = candidates.filter(candidate => {
          if (!search) return true
          return (
            candidate.name.toLowerCase().includes(search.toLowerCase()) ||
            candidate.email.toLowerCase().includes(search.toLowerCase()) ||
            (candidate.position && candidate.position.toLowerCase().includes(search.toLowerCase()))
          )
        })
        
        // Update ALL relevant query keys to ensure data is available everywhere
        queryClient.setQueryData(candidatesKeys.list(user.id, search), filteredCandidates)
        queryClient.setQueryData(candidatesKeys.list(user.id, ''), candidates) // Also update the base query
      }
    )

    return unsubscribe
  }, [user?.id, search, queryClient])

  return useQuery({
    queryKey: candidatesKeys.list(user?.id || '', search),
    queryFn: async () => {
      if (!user?.id) return []
      
      // Get candidates directly from Firebase (Redis caching handled server-side)
      return candidatesService.getCandidates(user.id, search)
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus since we have real-time updates
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: 1000,
  })
}

// Add candidate mutation
export function useAddCandidate() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  
  return useMutation({
    mutationFn: async (candidateData: {
      name: string
      email: string
      position?: string
      phone?: string
      location?: string
    }) => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const candidateId = await candidatesService.addCandidate({
        name: candidateData.name,
        email: candidateData.email,
        position: candidateData.position || '',
        phone: candidateData.phone,
        location: candidateData.location,
        createdBy: user.id,
        status: 'pending'
      })
      
      // Create notifications for ALL users (collaborative platform)
      await createCandidateNotificationForAllUsers(candidateData.name, user.name, 'added')
      
      return candidateId
    },
    onSuccess: async (data, variables) => {
      // The real-time subscription will automatically update the cache
      toast({
        title: "Candidate added successfully",
        description: `${variables.name} has been added to your candidate list.`,
      })
      
      // Activity tracking will be handled server-side
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to add candidate",
        description: error.message || "Something went wrong while adding the candidate.",
      })
    },
  })
}

// Update candidate mutation
export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Candidate> }) => {
      await candidatesService.updateCandidate(id, data)
      
      // Create notification if status changed
      if (data.status && user?.id) {
        await createCandidateNotification(user.id, data.name || 'Candidate', `Status updated to ${data.status}`)
      }
    },
    onSuccess: () => {
      // The real-time subscription will automatically update the cache
      toast({
        title: "Updated successfully",
        description: "Candidate info has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Couldn't update the candidate info.",
      })
    },
  })
}

// Delete candidate mutation
export function useDeleteCandidate() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get candidate info before deleting for the notification
      const candidate = await candidatesService.getCandidate(id)
      await candidatesService.deleteCandidate(id)
      
      // Create notification
      if (user?.id) {
        await createCandidateNotification(user.id, candidate.name, 'Candidate removed')
      }
    },
    onSuccess: () => {
      // The real-time subscription will automatically update the cache
      toast({
        title: "Candidate removed",
        description: "The candidate has been deleted from your list.",
      })
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message || "Couldn't remove the candidate.",
      })
    },
  })
}

// Get single candidate
export function useCandidate(id: string) {
  return useQuery({
    queryKey: candidatesKeys.detail(id),
    queryFn: async () => {
      return candidatesService.getCandidate(id)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

// Prefetch candidates (useful for performance optimization)
export function usePrefetchCandidates() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  
  return (search = '') => {
    queryClient.prefetchQuery({
      queryKey: candidatesKeys.list(user?.id || '', search),
      queryFn: async () => {
        if (!user?.id) return []
        return candidatesService.getCandidates(user.id, search)
      },
      staleTime: 30 * 1000,
    })
  }
} 