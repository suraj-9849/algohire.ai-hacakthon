'use client'

import { useEffect, useState } from 'react'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { Mail, User, Calendar } from 'lucide-react'
import { firestore } from '@/lib/firebase'
import { Candidate } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface CandidateListProps {
  onCandidateClick: (candidate: Candidate) => void
}

export function CandidateList({ onCandidateClick }: CandidateListProps): JSX.Element {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(firestore, 'candidates'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const candidatesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Candidate[]
      
      setCandidates(candidatesList)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
        <p className="text-gray-500">Add your first candidate to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <div
          key={candidate.id}
          onClick={() => onCandidateClick(candidate)}
          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {candidate.name}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{candidate.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 