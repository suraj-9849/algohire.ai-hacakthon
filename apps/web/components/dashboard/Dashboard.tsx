'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Bell, User, LogOut, Settings, Filter, ChevronDown, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AddCandidateDialog } from './AddCandidateDialog'
import { CandidateList } from './CandidateList'
import { CandidateNotesDialog } from './CandidateNotesDialog'
import { NotificationsList } from './NotificationsList'

import { useCandidates } from '@/hooks/useCandidates'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Candidate } from '@/lib/types'


const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const { user, logout } = useAuthContext()

  // Fetch candidates with search
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates(searchQuery)

  // Fetch notifications
  const { notifications, unreadCount } = useNotifications()

  // Filter and search candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.position && candidate.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (candidate.location && candidate.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter)
    }

    return filtered
  }, [candidates, searchQuery, statusFilter])

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleNotificationClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all'

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
                  <h1 className="text-xl font-bold text-gray-900">AlgoHire Notes</h1>
                  <p className="text-sm text-gray-500">Collaborative Candidate Notes</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-800" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              {/* User Dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-black text-white font-medium text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">{user.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                </div>

                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-black hover:bg-gray-800 text-white w-full lg:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Candidate
                </Button>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery.trim() && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Candidates List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Candidates
                  <Badge variant="secondary">{filteredCandidates.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {hasActiveFilters
                    ? `Showing ${filteredCandidates.length} filtered candidates`
                    : 'All candidates in your pipeline'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <CandidateList
                  candidates={filteredCandidates}
                  isLoading={candidatesLoading}
                  searchQuery={searchQuery}
                  onCandidateClick={handleCandidateClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Messages where you were mentioned
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <NotificationsList onNotificationClick={handleNotificationClick} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Recent Candidates */}
              <Card className="w-full">
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
              <Card className="w-full lg:h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Messages where you were mentioned
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 lg:flex-1">
                  <div className="max-h-80 lg:h-full">
                    <NotificationsList onNotificationClick={handleNotificationClick} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity to display</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        {showAddDialog && (
          <AddCandidateDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
          />
        )}

        {selectedCandidate && (
          <CandidateNotesDialog
            candidate={selectedCandidate}
            open={!!selectedCandidate}
            onOpenChange={(open) => !open && setSelectedCandidate(null)}
          />
        )}
      </main>
    </div>
  )
} 