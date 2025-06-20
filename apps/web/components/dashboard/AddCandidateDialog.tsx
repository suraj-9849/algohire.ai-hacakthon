'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAddCandidate } from '@/hooks/useCandidates'
import { useAuthContext } from '@/components/providers/AuthProvider'

const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  phone: z.string().optional(),
  location: z.string().optional(),
})

type CandidateForm = z.infer<typeof candidateSchema>

interface AddCandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCandidateDialog({ open, onOpenChange }: AddCandidateDialogProps) {
  const addCandidate = useAddCandidate()
  const { user } = useAuthContext()

  const form = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      name: '',
      email: '',
      position: '',
      phone: '',
      location: '',
    },
  })

  const onSubmit = async (data: CandidateForm) => {
    if (!user) return
    
    try {
      await addCandidate.mutateAsync({
        name: data.name,
        email: data.email,
        position: data.position,
        phone: data.phone || undefined,
        location: data.location || undefined,
        createdBy: user.id,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to add candidate:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
          <DialogDescription>
            Enter the candidate's details to add them to your pipeline.
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

          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              placeholder="e.g. Senior Software Engineer"
              {...form.register('position')}
            />
            {form.formState.errors.position && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.position.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              {...form.register('phone')}
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA"
              {...form.register('location')}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={addCandidate.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addCandidate.isPending}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {addCandidate.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Add Candidate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 