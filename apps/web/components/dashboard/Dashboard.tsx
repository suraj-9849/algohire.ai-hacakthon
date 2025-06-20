'use client'

import { useState } from 'react'
import { Plus, Bell, MessageSquare, Users, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { CandidateList } from './CandidateList'
import { NotificationsList } from './NotificationsList'
import { AddCandidateDialog } from './AddCandidateDialog'
import { CandidateNotesDialog } from './CandidateNotesDialog'
import { Candidate } from '@/lib/types'

export function Dashboard(): JSX.Element {
  const { user, logout } = useAuthContext()
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Candidate Notes</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Candidates</span>
                    </CardTitle>
                    <CardDescription>
                      Manage and view candidate profiles
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddCandidate(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CandidateList onCandidateClick={handleCandidateClick} />
              </CardContent>
            </Card>
          </div>

          {/* Notifications Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription>
                  Messages where you were mentioned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationsList onNotificationClick={handleCandidateClick} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddCandidateDialog 
        open={showAddCandidate} 
        onOpenChange={setShowAddCandidate} 
      />
      
      {selectedCandidate && (
        <CandidateNotesDialog
          candidate={selectedCandidate}
          open={!!selectedCandidate}
          onOpenChange={(open) => !open && setSelectedCandidate(null)}
        />
      )}
    </div>
  )
} 