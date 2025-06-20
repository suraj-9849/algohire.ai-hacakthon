import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { Candidate } from '@/lib/types'
import { toast } from '@/hooks/useToast'
import { useAuthContext } from '@/components/providers/AuthProvider'

// Query Keys
export const candidatesKeys = {
  all: ['candidates'] as const,
  lists: () => [...candidatesKeys.all, 'list'] as const,
  list: (filters: string) => [...candidatesKeys.lists(), { filters }] as const,
  details: () => [...candidatesKeys.all, 'detail'] as const,
  detail: (id: string) => [...candidatesKeys.details(), id] as const,
}

// Real-time candidates hook with React Query
export function useCandidates() {
  return useQuery({
    queryKey: candidatesKeys.lists(),
    queryFn: () => {
      return new Promise<Candidate[]>((resolve, reject) => {
        const q = query(
          collection(firestore, 'candidates'),
          orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const candidatesList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Candidate[]
            
            unsubscribe() // Clean up listener for this query
            resolve(candidatesList)
          },
          (error) => {
            reject(error)
          }
        )
      })
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

// Add candidate mutation
export function useAddCandidate() {
  const queryClient = useQueryClient()
  const { user } = useAuthContext()
  
  return useMutation({
    mutationFn: async (candidateData: Omit<Candidate, 'id' | 'createdAt'>) => {
      const docRef = await addDoc(collection(firestore, 'candidates'), {
        ...candidateData,
        createdAt: new Date(),
      })
      
      // Create notification for the current user (so they can see the notification system working)
      if (user?.id) {
        try {
          await addDoc(collection(firestore, 'notifications'), {
            message: `✨ You successfully added candidate ${candidateData.name}!`,
            type: 'candidate',
            read: false,
            timestamp: new Date(),
            userId: user.id, // Notify the current user
            candidateId: docRef.id,
            candidateName: candidateData.name,
            fromUser: user.id,
            fromUserName: user.name || 'You'
          })
        } catch (error) {
          console.log('Failed to create notification:', error)
        }
      }
      
      return docRef.id
    },
    onMutate: async (newCandidate) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: candidatesKeys.lists() })

      // Snapshot previous value
      const previousCandidates = queryClient.getQueryData(candidatesKeys.lists())

      // Optimistically update
      queryClient.setQueryData(candidatesKeys.lists(), (old: Candidate[] = []) => [
        {
          ...newCandidate,
          id: 'temp-' + Date.now(),
          createdAt: new Date(),
        },
        ...old,
      ])

      return { previousCandidates }
    },
    onError: (err, newCandidate, context) => {
      // Rollback on error
      queryClient.setQueryData(candidatesKeys.lists(), context?.previousCandidates)
      toast({
        variant: "destructive",
        title: "Failed to add candidate 😢",
        description: "Something went wrong while adding the candidate.",
      })
    },
    onSuccess: () => {
      toast({
        title: "Candidate added! 🎉",
        description: "The new candidate vibe has been added to your list.",
      })
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() })
    },
  })
}

// Update candidate mutation
export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Candidate> }) => {
      const candidateRef = doc(firestore, 'candidates', id)
      await updateDoc(candidateRef, data)
      return { id, data }
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: candidatesKeys.lists() })
      const previousCandidates = queryClient.getQueryData(candidatesKeys.lists())

      queryClient.setQueryData(candidatesKeys.lists(), (old: Candidate[] = []) =>
        old.map(candidate => 
          candidate.id === id ? { ...candidate, ...data } : candidate
        )
      )

      return { previousCandidates }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(candidatesKeys.lists(), context?.previousCandidates)
      toast({
        variant: "destructive",
        title: "Update failed 😔",
        description: "Couldn't update the candidate info.",
      })
    },
    onSuccess: () => {
      toast({
        title: "Updated! ✨",
        description: "Candidate info has been updated successfully.",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() })
    },
  })
}

// Delete candidate mutation
export function useDeleteCandidate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(firestore, 'candidates', id))
      return id
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: candidatesKeys.lists() })
      const previousCandidates = queryClient.getQueryData(candidatesKeys.lists())

      queryClient.setQueryData(candidatesKeys.lists(), (old: Candidate[] = []) =>
        old.filter(candidate => candidate.id !== id)
      )

      return { previousCandidates }
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(candidatesKeys.lists(), context?.previousCandidates)
      toast({
        variant: "destructive",
        title: "Delete failed 💀",
        description: "Couldn't remove the candidate.",
      })
    },
    onSuccess: () => {
      toast({
        title: "Candidate removed! 🗑️",
        description: "The candidate has been deleted from your list.",
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: candidatesKeys.lists() })
    },
  })
}

// Prefetch candidates (for performance optimization)
export function usePrefetchCandidates() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: candidatesKeys.lists(),
      queryFn: () => {
        return new Promise<Candidate[]>((resolve, reject) => {
          const q = query(
            collection(firestore, 'candidates'),
            orderBy('createdAt', 'desc')
          )

          const unsubscribe = onSnapshot(q, 
            (snapshot) => {
              const candidatesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
              })) as Candidate[]
              
              unsubscribe()
              resolve(candidatesList)
            },
            (error) => {
              reject(error)
            }
          )
        })
      },
      staleTime: 30 * 1000,
    })
  }
} 