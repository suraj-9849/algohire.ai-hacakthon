'use client'

import { useAuthContext } from '@/components/providers/AuthProvider'
import { AuthPage } from '@/components/auth/AuthPage'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}
