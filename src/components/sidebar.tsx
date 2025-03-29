'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './theme-provider'
import { 
  ChatBubbleLeftIcon, 
  UserGroupIcon, 
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { ThemeToggle } from './theme-toggle'

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  isGroup: boolean
  members?: string[]
  avatar?: string
}

interface SidebarProps {
  chats: Chat[]
  activeChat: Chat | null
  onChatSelect: (chatId: string) => void
  onClose?: () => void
}

const initialChats: Chat[] = [
  {
    id: '1',
    name: 'Design Team',
    lastMessage: 'Great work on the new layout!',
    timestamp: '10:30 AM',
    unreadCount: 3,
    isGroup: true,
    members: ['Alice', 'Bob', 'Charlie']
  },
  {
    id: '2',
    name: 'Project Sync',
    lastMessage: 'Meeting at 2 PM',
    timestamp: '9:45 AM',
    unreadCount: 1,
    isGroup: true,
    members: ['David', 'Emma', 'Frank', 'Grace']
  },
  {
    id: '3',
    name: 'Alice Smith',
    lastMessage: 'Thanks for your help!',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isGroup: false
  }
]

export function Sidebar({ chats, activeChat, onChatSelect, onClose }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = useMemo(() => {
    return chats.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [chats, searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Messages</h1>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted lg:hidden"
            title="Close sidebar"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-md bg-muted pl-9 pr-4 py-2 text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted-foreground/10"
                title="Clear search"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            className="rounded-full bg-primary p-2 text-primary-foreground hover:opacity-90"
            title="Create new group"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence initial={false}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => onChatSelect(chat.id)}
                className={`group mb-1 w-full rounded-lg p-3 text-left transition-colors ${
                  activeChat?.id === chat.id
                    ? 'bg-muted'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {chat.avatar ? (
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {chat.isGroup ? (
                          <UserGroupIcon className="h-6 w-6 text-primary" />
                        ) : (
                          <span className="text-lg font-semibold text-primary">
                            {chat.name[0]}
                          </span>
                        )}
                      </div>
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{chat.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </span>
                    </div>
                    {chat.isGroup && chat.members && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {chat.members.length} members
                      </p>
                    )}
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center p-4 text-center text-muted-foreground"
            >
              <p>No chats found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings */}
      <div className="border-t p-4">
        <ThemeToggle />
      </div>
    </div>
  )
} 