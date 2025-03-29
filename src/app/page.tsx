'use client'

import { useState, useEffect } from 'react'
import { ChatArea } from '@/components/chat-area'
import { Sidebar } from '@/components/sidebar'
import Preloader from '@/components/preloader'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { AnimatePresence } from 'framer-motion'

interface Member {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: string
}

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isGroup: boolean
  members?: Member[]
  avatar?: string
  pinnedMessages?: string[]
  typing?: string[]
}

const initialMembers: Member[] = [
  { id: '1', name: 'Alice', status: 'online' },
  { id: '2', name: 'Bob', status: 'away', lastSeen: '5m ago' },
  { id: '3', name: 'Charlie', status: 'offline', lastSeen: '1h ago' },
  { id: '4', name: 'David', status: 'online' },
  { id: '5', name: 'Emma', status: 'online' },
  { id: '6', name: 'Frank', status: 'away', lastSeen: '30m ago' },
  { id: '7', name: 'Grace', status: 'offline', lastSeen: '2h ago' }
]

const initialChats: Chat[] = [
  {
    id: '1',
    name: 'Design Team',
    lastMessage: 'Great work on the new layout!',
    timestamp: '10:30 AM',
    unreadCount: 3,
    isGroup: true,
    members: [initialMembers[0], initialMembers[1], initialMembers[2]],
    pinnedMessages: ['Remember to update the design system documentation'],
    typing: ['Alice']
  },
  {
    id: '2',
    name: 'Project Sync',
    lastMessage: 'Meeting at 2 PM',
    timestamp: '9:45 AM',
    unreadCount: 1,
    isGroup: true,
    members: [initialMembers[3], initialMembers[4], initialMembers[5], initialMembers[6]],
    pinnedMessages: ['Sprint planning every Monday at 10 AM', 'Project deadline: December 15th']
  },
  {
    id: '3',
    name: 'Alice Smith',
    lastMessage: 'Thanks for your help!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isGroup: false,
    members: [initialMembers[0]]
  }
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChat, setActiveChat] = useState<Chat | null>(chats[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchivedChats, setShowArchivedChats] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chats.find(chat => chat.id === chatId)
    if (selectedChat) {
      setActiveChat(selectedChat)
      setChats(prev =>
        prev.map(chat =>
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      )
      setSidebarOpen(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) {
    return null
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader />}
      </AnimatePresence>

      <main className="flex h-screen overflow-hidden bg-background">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-4 z-50 rounded-full bg-primary p-2 text-primary-foreground lg:hidden"
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-background transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            chats={filteredChats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onClose={() => setSidebarOpen(false)}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            showArchived={showArchivedChats}
            onToggleArchived={() => setShowArchivedChats(!showArchivedChats)}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1">
          <ChatArea 
            chat={activeChat}
            onUpdateChat={(updatedChat) => {
              setChats(prev => 
                prev.map(chat => 
                  chat.id === updatedChat.id ? updatedChat : chat
                )
              )
            }}
          />
        </div>

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </main>
    </>
  )
} 