'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  User, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock,
  Briefcase,
  GraduationCap,
  Eye,
  MessageCircle,
  TrendingUp
} from 'lucide-react'
import { Candidate } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

interface CandidateListProps {
  candidates: Candidate[]
  isLoading: boolean
  searchQuery: string
  onCandidateClick?: (candidate: Candidate) => void
}


const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}


export function CandidateList({ candidates, isLoading, searchQuery, onCandidateClick }: CandidateListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading candidates...</p>
        </motion.div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <User className="h-10 w-10 text-gray-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-black mb-2">
          {searchQuery ? 'No candidates found' : 'No candidates yet'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchQuery 
            ? `No candidates match "${searchQuery}". Try adjusting your search.`
            : 'Start building your talent pipeline by adding your first candidate.'
          }
        </p>
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center space-x-6 text-sm text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Track applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Collaborate with team</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Monitor progress</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {candidates.map((candidate, index) => {
          
          return (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => onCandidateClick?.(candidate)}
              className="group cursor-pointer"
            >
              <Card className="border-gray-200 bg-white hover:shadow-lg transition-all duration-300 group-hover:border-gray-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-14 w-14 border-2 border-gray-200 shadow-sm">
                        <AvatarFallback className="bg-black text-white font-semibold text-lg">
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-black group-hover:text-gray-700 transition-colors">
                              {candidate.name}
                            </h3>
                           
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{candidate.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(candidate.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{candidate.position}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{candidate.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Click to view notes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
} 