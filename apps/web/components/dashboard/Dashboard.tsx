'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Bell, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CandidateList } from './CandidateList'
import { AddCandidateDialog } from './AddCandidateDialog'
import { CandidateNotesDialog } from './CandidateNotesDialog'
import { NotificationsList } from './NotificationsList'
import { useCandidates } from '@/hooks/useCandidates'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Candidate } from '@/lib/types'

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const { data: candidates = [], isLoading } = useCandidates()
  const { createDemoNotifications, unreadCount } = useNotifications()
  const { user, logout } = useAuthContext()

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleLogout = async () => {
    await logout()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Generate real activity from candidates data
  const recentActivity = candidates.slice(0, 5).map(candidate => {
    const timeAgo = Math.floor((Date.now() - new Date(candidate.createdAt).getTime()) / (1000 * 60 * 60))
    const hours = timeAgo < 1 ? 'just now' : `${timeAgo} hour${timeAgo === 1 ? '' : 's'} ago`
    
    return {
      action: 'New candidate added',
      candidate: candidate.name,
      time: hours,
      type: 'added',
      candidateId: candidate.id
    }
  })


  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (candidate.position && candidate.position.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">AlgoHire</h1>
                <p className="text-sm text-gray-600">Collaborative Candidate Notes</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="relative border-gray-300 hover:bg-gray-50"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 bg-black text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-black">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-gray-600">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-gray-100">
            <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="candidates" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
              Candidates
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
              Activity
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-sm data-[state=active]:bg-black data-[state=active]:text-white">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
           
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Candidates */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-gray-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2 text-xl text-black">
                            <Users className="h-5 w-5 text-gray-600" />
                            <span>Recent Candidates</span>
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Latest candidate profiles in your pipeline
                          </CardDescription>
                        </div>
                        <Button 
                          onClick={() => setIsAddDialogOpen(true)} 
                          className="bg-black hover:bg-gray-800 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Candidate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CandidateList 
                        candidates={candidates.slice(0, 3)} 
                        isLoading={isLoading}
                        searchQuery=""
                        onCandidateClick={handleCandidateClick}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Notifications */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg text-black">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span>Notifications</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Messages where you were mentioned
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NotificationsList onNotificationClick={handleCandidateClick} />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            {/* Search and Add */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-black focus:ring-black"
                />
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </motion.div>

            {/* Candidates List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CandidateList 
                candidates={filteredCandidates} 
                isLoading={isLoading}
                searchQuery={searchQuery}
                onCandidateClick={handleCandidateClick}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black">Activity Feed</CardTitle>
                <CardDescription>Comprehensive timeline of all hiring activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.candidate} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-black">All Notifications</CardTitle>
                    <CardDescription>Messages where you were mentioned</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={createDemoNotifications}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Create Demo Notifications
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <NotificationsList onNotificationClick={handleCandidateClick} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddCandidateDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
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