'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, query, onSnapshot, orderBy, addDoc, where, getDocs } from 'firebase/firestore'
import { ref, push, onValue, off } from 'firebase/database'
import { Send, AtSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { firestore, database } from '@/lib/firebase'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { Candidate, Message, User } from '@/lib/types'
import { toast } from '@/hooks/useToast'

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
  const { user } = useAuthContext()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all users for mentions
  useEffect(() => {
    const loadUsers = async () => {
      const usersSnapshot = await getDocs(collection(firestore, 'users'))
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as User[]
      setUsers(usersList)
    }
    loadUsers()
  }, [])

  // Real-time messages listener
  useEffect(() => {
    if (!open || !candidate.id) return

    const messagesRef = ref(database, `messages/${candidate.id}`)
    
    const handleMessages = (snapshot: any) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val()
        const messagesList = Object.keys(messagesData).map(key => ({
          id: key,
          ...messagesData[key],
          timestamp: new Date(messagesData[key].timestamp)
        })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        
        setMessages(messagesList)
      } else {
        setMessages([])
      }
      setLoading(false)
    }

    onValue(messagesRef, handleMessages)

    return () => {
      off(messagesRef, 'value', handleMessages)
    }
  }, [open, candidate.id])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Check for @ symbol for mentions
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf('@')
    
    if (atIndex !== -1 && atIndex === textBeforeCursor.length - 1) {
      setShowMentions(true)
      setMentionFilter('')
    } else if (atIndex !== -1 && textBeforeCursor.substring(atIndex + 1).indexOf(' ') === -1) {
      setShowMentions(true)
      setMentionFilter(textBeforeCursor.substring(atIndex + 1))
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (mentionUser: User) => {
    const atIndex = newMessage.lastIndexOf('@')
    if (atIndex !== -1) {
      const beforeAt = newMessage.substring(0, atIndex)
      const afterMention = newMessage.substring(atIndex + mentionFilter.length + 1)
      setNewMessage(`${beforeAt}@${mentionUser.name} ${afterMention}`)
    }
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const extractMentions = (text: string) => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1]
      if (mentionedName) {
        const mentionedUser = users.find(u => u.name.toLowerCase() === mentionedName.toLowerCase())
        if (mentionedUser) {
          mentions.push(mentionedUser.id)
        }
      }
    }

    return mentions
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    setSending(true)
    try {
      const mentions = extractMentions(newMessage)
      const messageData = {
        candidateId: candidate.id,
        content: newMessage.trim(),
        senderId: user.id,
        senderName: user.name,
        timestamp: Date.now(),
        mentions
      }

      // Send to Firebase Realtime Database for real-time updates
      await push(ref(database, `messages/${candidate.id}`), messageData)

      // Create notifications for mentioned users
      for (const mentionedUserId of mentions) {
        await addDoc(collection(firestore, 'notifications'), {
          userId: mentionedUserId,
          candidateId: candidate.id,
          candidateName: candidate.name,
          content: newMessage.trim(),
          senderName: user.name,
          timestamp: new Date(),
          read: false
        })
      }

      setNewMessage('')
      setShowMentions(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message || "Please try again.",
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

  const filteredUsers = users.filter(u => 
    u.id !== user?.id && 
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id
    
    // Highlight mentions in message content
    const highlightMentions = (text: string) => {
      return text.replace(/@(\w+(?:\s+\w+)*)/g, '<span class="bg-blue-100 text-blue-800 px-1 rounded">@$1</span>')
    }

    return (
      <div
        key={message.id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="text-xs opacity-75 mb-1">
            {message.senderName} • {message.timestamp.toLocaleTimeString()}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: highlightMentions(message.content)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Notes for {candidate.name}</DialogTitle>
        </DialogHeader>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div>
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Mentions Dropdown */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="border rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
            {filteredUsers.map(mentionUser => (
              <div
                key={mentionUser.id}
                onClick={() => insertMention(mentionUser)}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              >
                <AtSign className="h-4 w-4 text-gray-400" />
                <span>{mentionUser.name}</span>
                <span className="text-sm text-gray-500">({mentionUser.email})</span>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... Use @ to mention someone"
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
            {sending ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 