'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { collection, addDoc } from 'firebase/firestore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { firestore } from '@/lib/firebase'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { toast } from '@/hooks/useToast'

const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type CandidateForm = z.infer<typeof candidateSchema>

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCandidateDialog({ open, onOpenChange }: AddCandidateDialogProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const { user } = useAuthContext()

  const form = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onSubmit = async (data: CandidateForm) => {
    if (!user) return
    
    setLoading(true)
    try {
      await addDoc(collection(firestore, 'candidates'), {
        name: data.name,
        email: data.email,
        createdAt: new Date(),
        createdBy: user.id,
      })

      toast({
        title: "Candidate added",
        description: `${data.name} has been added successfully.`,
      })

      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding candidate",
        description: error.message || "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter the candidate's details to add them to your list.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter candidate's full name"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter candidate's email"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Add Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 