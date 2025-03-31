'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaperAirplaneIcon, PaperClipIcon, EllipsisVerticalIcon, MicrophoneIcon } from '@heroicons/react/24/solid'
import { VoiceMessage } from './voice-message'
import { MessageReactions } from './message-reactions'
import { FileDropZone } from './file-drop-zone'
import { store } from '@/lib/store'
import { useAuth } from '@/providers/AuthProvider'

interface Message {
  id: string
  chatId: string
  content: string
  sender: string
  timestamp: string
  type: 'text' | 'voice' | 'file' | 'image'
  fileUrl?: string
  fileName?: string
  mimeType?: string
  reactions: {
    emoji: string
    count: number
    users: string[]
  }[]
}

interface ChatAreaProps {
  chat: {
    id: string
    name: string
    isGroup: boolean
    members?: { id: string; name: string; status: string }[]
    typing?: string[]
  } | null
  onUpdateChat: (chat: any) => void
}

export function ChatArea({ chat, onUpdateChat }: ChatAreaProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [showDropZone, setShowDropZone] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const voiceRecorderRef = useRef<HTMLDivElement>(null)
  const currentUser = user?.name || 'You' // Use the actual username

  // Load messages when chat changes
  useEffect(() => {
    if (!chat || !user) return;
    
    // Check if this is a group chat or direct conversation
    if (chat.isGroup) {
      // For group chats, get messages from the group
      const group = store.getGroup(chat.id);
      if (group) {
        setMessagesMap(prev => ({
          ...prev,
          [chat.id]: group.messages.map(msg => ({
            id: msg.id,
            chatId: chat.id,
            content: msg.content,
            sender: msg.senderId === user.id ? currentUser : store.getUser(msg.senderId)?.name || 'Unknown',
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            type: 'text',
            reactions: msg.reactions || []
          }))
        }));
      }
    } else {
      // For direct conversations, get messages from the conversation
      const conversation = store.getConversation(chat.id);
      if (conversation) {
        setMessagesMap(prev => ({
          ...prev,
          [chat.id]: conversation.messages.map(msg => ({
            id: msg.id,
            chatId: chat.id,
            content: msg.content,
            sender: msg.senderId === user.id ? currentUser : store.getUser(msg.senderId)?.name || 'Unknown',
            timestamp: new Date(msg.timestamp).toLocaleTimeString(),
            type: 'text',
            reactions: msg.reactions || []
          }))
        }));
      }
    }
  }, [chat, user, currentUser]);

  // Get messages for current chat
  const currentMessages = chat ? (messagesMap[chat.id] || []) : []

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'file' | 'image' = 'text', fileData?: { url: string, name: string, type: string }) => {
    if (!chat || !user || (!content.trim() && type === 'text')) return

    // Create a new message in the UI
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: chat.id,
      content,
      sender: currentUser,
      timestamp: new Date().toLocaleTimeString(),
      type,
      reactions: [],
      ...(fileData ? {
        fileUrl: fileData.url,
        fileName: fileData.name,
        mimeType: fileData.type
      } : {})
    }

    // Update the UI immediately
    setMessagesMap(prev => ({
      ...prev,
      [chat.id]: [...(prev[chat.id] || []), newMessage]
    }))
    setMessage('')
    
    // Save to store based on chat type
    if (chat.isGroup) {
      // It's a group message
      try {
        store.sendGroupMessage(chat.id, user.id, content);
      } catch (error) {
        console.error('Failed to send group message:', error);
      }
    } else {
      // It's a direct message
      try {
        store.sendMessage(chat.id, user.id, content);
      } catch (error) {
        console.error('Failed to send direct message:', error);
      }
    }
    
    // Update chat's last message in the sidebar
    onUpdateChat({
      ...chat,
      lastMessage: type === 'text' ? content : `Sent a ${type}`,
      timestamp: 'Just now'
    })
  }

  const handleReaction = (messageId: string, emoji: string) => {
    setMessagesMap(prev => ({
      ...prev,
      [chat!.id]: prev[chat!.id].map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji)
          if (existingReaction) {
            if (existingReaction.users.includes(currentUser)) {
              // Remove user's reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r => 
                  r.emoji === emoji 
                    ? { 
                        ...r, 
                        count: r.count - 1,
                        users: r.users.filter(u => u !== currentUser)
                      }
                    : r
                ).filter(r => r.count > 0)
              }
            } else {
              // Add user's reaction to existing emoji
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count + 1,
                        users: [...r.users, currentUser]
                      }
                    : r
                )
              }
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, users: [currentUser] }]
            }
          }
        }
        return msg
      })
    }))
  }

  const handleVoiceMessage = (blob: Blob) => {
    if (!chat) return
    const url = URL.createObjectURL(blob)
    handleSendMessage(url, 'voice', { 
      url, 
      name: `Voice message (${new Date().toLocaleTimeString()})`,
      type: blob.type
    })
  }

  const handleFilesDrop = (files: File[]) => {
    if (!chat) return
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith('image/') ? 'image' : 'file'
      handleSendMessage(url, type, { 
        url, 
        name: file.name,
        type: file.type
      })
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    handleFilesDrop(files)
    event.target.value = '' // Reset input
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (dropZoneRef.current && !dropZoneRef.current.contains(event.target as Node)) {
      setShowDropZone(false)
    }
    if (voiceRecorderRef.current && !voiceRecorderRef.current.contains(event.target as Node)) {
      setShowVoiceRecorder(false)
    }
  }

  useEffect(() => {
    if (showDropZone || showVoiceRecorder) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropZone, showVoiceRecorder])

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">Welcome to ChatSync</h3>
          <p className="text-muted-foreground">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="border-b p-4 sticky top-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold">{chat.name[0]}</span>
              </div>
              {chat.isGroup && chat.members && chat.members.some(m => m.status === 'online') && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{chat.name}</h2>
              {chat.isGroup && chat.members && (
                <p className="text-sm text-muted-foreground">
                  {chat.members.length} members • {chat.members.filter(m => m.status === 'online').length} online
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-full hover:bg-secondary"
            title="Chat options"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty State - Show a prompt to start the conversation */}
        {currentMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-600/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="space-y-3 max-w-md">
              <h3 className="text-xl font-semibold">Start a conversation with {chat.name}</h3>
              <p className="text-muted-foreground">
                {chat.isGroup 
                  ? `This is the beginning of the group chat "${chat.name}". Say hello to everyone!` 
                  : `This is the beginning of your conversation with ${chat.name}. Send a friendly message to get started!`}
              </p>
              <button
                onClick={() => {
                  const message = chat.isGroup 
                    ? `Hello everyone in ${chat.name}!` 
                    : `Hi ${chat.name}! How are you doing?`;
                  handleSendMessage(message);
                }}
                className="mt-4 py-2.5 px-6 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all"
              >
                Say Hello
              </button>
            </div>
          </div>
        )}
        
        {/* Regular Messages */}
        {currentMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-lg p-3 ${
              msg.sender === currentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            }`}>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{msg.sender}</span>
                  <span className="text-xs opacity-70">{msg.timestamp}</span>
                </div>
                {msg.type === 'text' && <p className="break-words">{msg.content}</p>}
                {msg.type === 'voice' && (
                  <audio 
                    controls 
                    src={msg.content} 
                    className="max-w-full" 
                    controlsList="nodownload"
                  />
                )}
                {msg.type === 'image' && msg.fileUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden max-w-[300px]">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName || 'Shared image'}
                        className="object-cover w-full h-full rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                        loading="lazy"
                        onClick={() => window.open(msg.fileUrl, '_blank')}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white truncate max-w-[200px]">
                          {msg.fileName}
                        </span>
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName}
                          className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                          title="Download image"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-sm">⬇️</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                {msg.type === 'file' && msg.fileUrl && (
                  <div className="mt-2 max-w-[300px]">
                    <a
                      href={msg.fileUrl}
                      download={msg.fileName}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
                    >
                      <span className="text-2xl">📎</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {msg.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Click to download
                        </div>
                      </div>
                    </a>
                  </div>
                )}
              </div>
              <MessageReactions
                reactions={msg.reactions}
                onReact={(emoji) => handleReaction(msg.id, emoji)}
                currentUser={currentUser}
              />
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {chat.typing && chat.typing.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm"
          >
            {chat.typing.join(', ')} {chat.typing.length === 1 ? 'is' : 'are'} typing...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t sticky bottom-0 bg-background">
        <div className="p-4 flex items-center space-x-2">
          <div className="flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                title="Record voice message"
              >
                <MicrophoneIcon className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {showVoiceRecorder && (
                  <motion.div
                    ref={voiceRecorderRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 bg-background border rounded-lg shadow-lg p-4"
                    style={{ zIndex: 50 }}
                  >
                    <VoiceMessage 
                      onRecordingComplete={(blob) => {
                        handleVoiceMessage(blob)
                        setShowVoiceRecorder(false)
                      }} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropZone(!showDropZone)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                title="Attach file"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {showDropZone && (
                  <motion.div
                    ref={dropZoneRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 w-[300px] bg-background border rounded-lg shadow-lg"
                    style={{ zIndex: 50 }}
                  >
                    <FileDropZone onFilesDrop={handleFilesDrop} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            title="Upload files"
            aria-label="Upload files"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setIsTyping(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(message)
                }
              }}
              placeholder="Type a message..."
              className="w-full min-h-[40px] px-4 py-2 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
            />
            <button
              onClick={() => handleSendMessage(message)}
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 