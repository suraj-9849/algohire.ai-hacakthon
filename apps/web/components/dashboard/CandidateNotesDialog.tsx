'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, AtSign, Brain, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Candidate, User } from '@/lib/types'
import { toast } from '@/hooks/useToast'
import { messagingService, Message } from '@/lib/messaging-service'
import { findUsersByQuery } from '@/lib/firebase-services'
import { Badge } from '@/components/ui/badge'
import { geminiService, CandidateSummary } from '@/lib/gemini-service'
import { AISummaryPanel } from './AISummaryPanel'

interface CandidateNotesDialogProps {
  candidate: Candidate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateNotesDialog({ candidate, open, onOpenChange }: CandidateNotesDialogProps): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [showAISummary, setShowAISummary] = useState(false)
  const [aiSummary, setAiSummary] = useState<CandidateSummary | null>(null)
  const [loadingAISummary, setLoadingAISummary] = useState(false)
  const { user } = useAuthContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load users for autocomplete when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async (query = '') => {
    try {
      const usersList = await findUsersByQuery(query)
      setUsers(usersList)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  // Real-time messages subscription
  useEffect(() => {
    if (!open || !candidate.id) return

    setLoading(true)

    const unsubscribe = messagingService.subscribeToMessages(
      candidate.id,
      (newMessages) => {
        setMessages(newMessages)
        setLoading(false)
      }
    )

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [open, candidate.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle @mentions autocomplete
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Check for @ symbol for mentions
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.substring(atIndex + 1)
      if (searchTerm.length === 0 || searchTerm.indexOf(' ') === -1) {
        setShowMentions(true)
        setMentionFilter(searchTerm)
        loadUsers(searchTerm)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (mentionUser: User) => {
    const atIndex = newMessage.lastIndexOf('@')
    if (atIndex !== -1) {
      const beforeAt = newMessage.substring(0, atIndex)
      const afterAt = newMessage.substring(atIndex + mentionFilter.length + 1)
      setNewMessage(`${beforeAt}@${mentionUser.name} ${afterAt}`)
    }
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const generateAISummary = async () => {
    if (messages.length === 0) {
      toast({
        variant: "destructive",
        title: "No notes to analyze",
        description: "Add some notes about the candidate first.",
      })
      return
    }

    setLoadingAISummary(true)
    setShowAISummary(true)

    try {
      const noteContents = messages.map(msg => `${msg.senderName}: ${msg.content}`)
      const summary = await geminiService.generateCandidateSummary(
        candidate.name,
        candidate.position || 'Software Engineer', // Default position if not specified
        noteContents
      )

      setAiSummary(summary)

      toast({
        title: "AI Summary Generated!",
        description: "The AI has analyzed all candidate notes.",
      })
    } catch (error) {
      console.error('Error generating AI summary:', error)
      toast({
        variant: "destructive",
        title: "Failed to generate AI summary",
        description: "Something went wrong. Please try again.",
      })
      setShowAISummary(false)
    } finally {
      setLoadingAISummary(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await messagingService.sendMessage({
        candidateId: candidate.id,
        content: newMessage.trim(),
        senderId: user.id,
        senderName: user.name,
        candidateName: candidate.name
      })

      setNewMessage('')

      toast({
        title: "Message sent",
        description: "Your note has been added to the candidate.",
      })

      // Check if there were mentions
      const mentionCount = (newMessage.match(/@\w+/g) || []).length
      if (mentionCount > 0) {
        toast({
          title: "Mentions sent",
          description: `Notified ${mentionCount} user(s) about your message.`,
        })
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || "Something went wrong while sending your message.",
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderId === user?.id

    // Split text by mentions and render with proper components
    const renderMessageContent = (text: string) => {
      const mentionRegex = /@([a-zA-Z0-9_\s]+)(?=\s|$|[.,!?])/g
      const parts = []
      let lastIndex = 0
      let match

      while ((match = mentionRegex.exec(text)) !== null) {
        // Add text before mention
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }

        // Add mention as Badge component
        parts.push(
          <Badge
            key={`mention-${match.index}`}
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-1 py-0 text-xs font-semibold"
          >
            @{match[1]}
          </Badge>
        )

        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return parts.length > 0 ? parts : [text]
    }

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          <div
            className={`p-3 rounded-lg ${isCurrentUser
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800'
              }`}
          >
            <div className="text-sm">
              {renderMessageContent(message.content)}
            </div>
          </div>
          <div
            className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'
              }`}
          >
            {isCurrentUser ? 'You' : message.senderName} • {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(mentionFilter.toLowerCase()) && u.id !== user?.id
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${showAISummary ? 'max-w-7xl' : 'max-w-2xl'} h-[600px] flex flex-col transition-all duration-300`}>
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 flex-1 min-w-0">
              Notes for {candidate.name}
              <span className="text-sm text-gray-500">({candidate.email})</span>
            </DialogTitle>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!showAISummary ? (
                <Button
                  onClick={generateAISummary}
                  disabled={messages.length === 0 || loadingAISummary}
                  className="bg-black hover:bg-gray-800 text-white border border-gray-300"
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Summary
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAISummary(false)}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Summary
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          <motion.div
            animate={{
              width: showAISummary ? '50%' : '100%',
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex flex-col h-full"
          >
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                  <span className="ml-2">Loading messages for {candidate.name}...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No messages yet for {candidate.name}.</p>
                  <p className="text-sm">Start the conversation by sending the first note!</p>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    {messages.length} message{messages.length !== 1 ? 's' : ''} for {candidate.name}
                  </div>
                  {messages.map(renderMessage)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showMentions && filteredUsers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 mb-2 max-h-40 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-2 px-2">Mention someone:</div>
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                    onClick={() => insertMention(user)}
                  >
                    <AtSign size={12} className="text-gray-500" />
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">({user.email})</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your note... Use @ to mention someone"
                disabled={sending}
                className="flex-1 border-gray-300 focus:border-gray-500"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="icon"
                className="bg-black hover:bg-gray-800 text-white"
              >
                {sending ? <LoadingSpinner size="sm" /> : <Send size={16} />}
              </Button>
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Tip: Use @username to mention team members and notify them about this candidate
            </div>
          </motion.div>

          <AnimatePresence>
            {showAISummary && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: 20 }}
                animate={{ opacity: 1, width: '50%', x: 0 }}
                exit={{ opacity: 0, width: 0, x: 20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="h-full overflow-hidden"
              >
                {aiSummary && (
                  <AISummaryPanel
                    summary={aiSummary}
                    candidateName={candidate.name}
                    isLoading={loadingAISummary}
                  />
                )}
                {loadingAISummary && (
                  <AISummaryPanel
                    summary={{} as CandidateSummary}
                    candidateName={candidate.name}
                    isLoading={true}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
} 