'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

import { AddCandidateDialog } from './AddCandidateDialog'
import { CandidateList } from './CandidateList'
import { CandidateNotesDialog } from './CandidateNotesDialog'
import { NotificationsList } from './NotificationsList'

import { useCandidates } from '@/hooks/useCandidates'
import { useNotifications } from '@/hooks/useNotifications'
import { Candidate } from '@/lib/types'

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  
  // Fetch candidates with search
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates(searchQuery)
  
  // Fetch notifications
  const { notifications, unreadCount } = useNotifications()

  // Filter candidates based on search query
  const searchedCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates
    
    const filtered = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.position && candidate.position.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    
    return filtered
  }, [candidates, searchQuery])

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleNotificationClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AlgoHire</h1>
                  <p className="text-sm text-gray-500">Collaborative Candidate Notes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">GS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
            
            {/* Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </div>

            {/* Recent Candidates Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Recent Candidates
                </CardTitle>
                <CardDescription>
                  Latest candidate profiles in your pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CandidateList 
                  candidates={searchedCandidates}
                  isLoading={candidatesLoading}
                  searchQuery={searchQuery}
                  onCandidateClick={handleCandidateClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Messages where you were mentioned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationsList onNotificationClick={handleNotificationClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Candidates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Recent Candidates
                  </CardTitle>
                  <CardDescription>
                    Latest candidate profiles in your pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <CandidateList 
                    candidates={candidates.slice(0, 3)}
                    isLoading={candidatesLoading}
                    searchQuery=""
                    onCandidateClick={handleCandidateClick}
                  />
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Messages where you were mentioned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationsList onNotificationClick={handleNotificationClick} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>
                  Recent activity across all candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Activity feed coming soon...</p>
                  <p className="text-sm">Track all interactions and updates here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddCandidateDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
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