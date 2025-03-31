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
  ArrowLeftIcon,
  UserIcon,
  BellIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/providers/AuthProvider'
import { store } from '@/lib/store'
import FriendRequests from './friends/FriendRequests'

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
  const [searchQuery, setSearchQuery] = useState('')
  const { theme } = useTheme()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<'chats' | 'requests' | 'profile'>('chats')
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  // Update pending requests count
  useMemo(() => {
    if (user) {
      const pendingRequests = store.getPendingRequests(user.id)
      setPendingRequestsCount(pendingRequests.length)
    }
  }, [user])

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats

    const query = searchQuery.toLowerCase()
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
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
          <h1 className="text-xl font-semibold">
            {activeSection === 'chats' && 'Messages'}
            {activeSection === 'requests' && 'Friend Requests'}
            {activeSection === 'profile' && 'My Profile'}
          </h1>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted lg:hidden"
            title="Close sidebar"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>

        {activeSection === 'chats' && (
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
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto">
        {/* Chats List */}
        {activeSection === 'chats' && (
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{chat.name}</h3>
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
        )}

        {/* Friend Requests */}
        {activeSection === 'requests' && (
          <div className="p-4">
            <FriendRequests />
          </div>
        )}

        {/* Profile Section */}
        {activeSection === 'profile' && user && (
          <div className="p-4">
            <UserProfile />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setActiveSection('chats')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeSection === 'chats' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
            }`}
            title="Chats"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Chats</span>
          </button>
          
          <button
            onClick={() => setActiveSection('requests')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors relative ${
              activeSection === 'requests' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
            }`}
            title="Requests"
          >
            <BellIcon className="h-6 w-6" />
            {pendingRequestsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {pendingRequestsCount}
              </span>
            )}
            <span className="text-xs mt-1">Requests</span>
          </button>
          
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
              activeSection === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
            }`}
            title="Profile"
          >
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
        
        <ThemeToggle />
      </div>
    </div>
  )
}

function UserProfile() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [profileImage, setProfileImage] = useState(user?.image || '')
  
  if (!user) return null
  
  const handleSaveProfile = () => {
    // In a real app, we would update the user profile in the database
    // For this demo, we'll just update it in localStorage
    const updatedUser = {
      ...user,
      name,
      image: profileImage
    }
    
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditing(false)
    
    // Reload the page to apply changes
    window.location.reload()
  }
  
  return (
    <div className="bg-slate-900 dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-slate-800">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-3xl shadow-md">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name} 
                className="h-full w-full object-cover rounded-full border-2 border-slate-600" 
              />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          {isEditing && (
            <button 
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg"
              onClick={() => {
                // In a real app, this would open a file picker
                const newImage = prompt('Enter image URL:', profileImage)
                if (newImage) setProfileImage(newImage)
              }}
              aria-label="Change profile picture"
              title="Change profile picture"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4 w-full">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-slate-700 border border-slate-700 rounded-md text-slate-300 cursor-not-allowed"
                placeholder="Your email"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            
            <div className="mt-6 flex flex-col gap-3 w-full">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 text-sm font-medium rounded-md border border-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                Edit Profile
              </button>
              
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm font-medium rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-900/50 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 