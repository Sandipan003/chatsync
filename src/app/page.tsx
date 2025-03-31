'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import AddFriend from '@/components/friends/AddFriend'
import CreateGroup from '@/components/groups/CreateGroup'
import { store, Group } from '@/lib/store'
import GroupSettings from '@/components/groups/GroupSettings'
import { Sidebar } from '@/components/sidebar'
import { ChatArea } from '@/components/chat-area'

export default function Home() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  
  // Mocked chat data based on groups and friends
  const [chats, setChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any | null>(null)

  // Add a new useEffect to listen for the selectChat event
  useEffect(() => {
    // Event handler for selecting a chat when a friend request is accepted
    const handleSelectChat = (e: CustomEvent) => {
      try {
        const { chatId } = e.detail;
        const selectedChat = chats.find(chat => chat.id === chatId);
        
        if (selectedChat) {
          setActiveChat(selectedChat);
        } else {
          // If chat isn't in the list yet (new conversation), refresh chats
          if (user) {
            loadUserChats(user);
            
            // Try to find the chat again after a small delay
            setTimeout(() => {
              const updatedChat = chats.find(chat => chat.id === chatId);
              if (updatedChat) {
                setActiveChat(updatedChat);
              }
            }, 300);
          }
        }
      } catch (error) {
        console.error('Error handling chat selection:', error);
      }
    };

    try {
      // Add event listener
      window.addEventListener('selectChat', handleSelectChat as EventListener);
      
      // Cleanup
      return () => {
        window.removeEventListener('selectChat', handleSelectChat as EventListener);
      };
    } catch (error) {
      console.error('Error setting up chat selection event listener:', error);
    }
  }, [chats, user]);

  // Function to load user chats (extracted from the useEffect)
  const loadUserChats = (currentUser: any) => {
    const chatList = [];
    
    // Add groups to chat list
    const userGroups = store.getUserGroups(currentUser.id);
    for (const group of userGroups) {
      chatList.push({
        id: group.id,
        name: group.name,
        lastMessage: group.messages.length > 0 
          ? group.messages[group.messages.length - 1].content 
          : 'No messages yet',
        timestamp: group.messages.length > 0 
          ? new Date(group.messages[group.messages.length - 1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          : '',
        unreadCount: 0,
        isGroup: true,
        members: group.members,
        avatar: group.image
      });
    }
    
    // Add friends (direct conversations) to chat list
    const friends = store.getUserFriends(currentUser.id);
    for (const friend of friends) {
      // Find conversation with this friend
      const conversations = store.getUserConversations(currentUser.id);
      const conversation = conversations.find(c => 
        c.participants.length === 2 && 
        c.participants.includes(friend.id)
      );
      
      if (conversation) {
        chatList.push({
          id: conversation.id,
          name: friend.name,
          lastMessage: conversation.messages.length > 0 
            ? conversation.messages[conversation.messages.length - 1].content 
            : 'No messages yet',
          timestamp: conversation.messages.length > 0 
            ? new Date(conversation.messages[conversation.messages.length - 1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : '',
          unreadCount: 0,
          isGroup: false,
          avatar: friend.image
        });
      }
    }
    
    setChats(chatList);
  };

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !user) {
      router.push('/login')
    }

    // Load user groups and chats
    if (user) {
      const userGroups = store.getUserGroups(user.id)
      setGroups(userGroups)
      
      // Load chats using the extracted function
      loadUserChats(user);
    }
  }, [user, loading, router])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null // We're redirecting in the useEffect, so just return null
  }

  // Handle group settings visibility
  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId)
  }

  const closeGroupSettings = () => {
    setSelectedGroupId(null)
    // Refresh groups after closing settings
    if (user) {
      const userGroups = store.getUserGroups(user.id)
      setGroups(userGroups)
    }
  }
  
  const handleChatSelect = (chatId: string) => {
    const selected = chats.find(chat => chat.id === chatId)
    setActiveChat(selected)
    setShowMobileSidebar(false)
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar 
          chats={chats} 
          activeChat={activeChat} 
          onChatSelect={handleChatSelect}
          onClose={() => setShowMobileSidebar(false)} 
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-slate-800 p-4 flex items-center justify-between">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden rounded-full p-2 hover:bg-slate-800"
            aria-label="Open sidebar menu"
            title="Open sidebar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold mx-auto">
            {activeChat ? activeChat.name : 'Welcome to Chat App'}
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => document.getElementById('create-group-modal')?.classList.remove('hidden')}
              className="rounded-full p-2 hover:bg-slate-800"
              title="Create Group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <button
              onClick={() => document.getElementById('add-friend-modal')?.classList.remove('hidden')}
              className="rounded-full p-2 hover:bg-slate-800"
              title="Add Friend"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeChat ? (
            <ChatArea 
              chat={activeChat} 
              onUpdateChat={(updatedChat) => {
                setChats(prev => 
                  prev.map(c => c.id === updatedChat.id ? { ...c, ...updatedChat } : c)
                )
              }} 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome to Chat App</h2>
                <p className="text-slate-400 mb-8">
                  Select a chat from the sidebar or start a new conversation
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => document.getElementById('add-friend-modal')?.classList.remove('hidden')}
                    className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700"
                  >
                    Add a Friend
                  </button>
                  <button
                    onClick={() => document.getElementById('create-group-modal')?.classList.remove('hidden')}
                    className="bg-slate-700 text-white rounded-lg px-6 py-3 hover:bg-slate-600"
                  >
                    Create a Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <div id="add-friend-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Add a Friend</h2>
            <button
              onClick={() => document.getElementById('add-friend-modal')?.classList.add('hidden')}
              className="text-slate-400 hover:text-white"
              aria-label="Close add friend modal"
              title="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <AddFriend onClose={() => document.getElementById('add-friend-modal')?.classList.add('hidden')} />
        </div>
      </div>
      
      <div id="create-group-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-lg shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create a Group</h2>
            <button
              onClick={() => document.getElementById('create-group-modal')?.classList.add('hidden')}
              className="text-slate-400 hover:text-white"
              aria-label="Close create group modal"
              title="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CreateGroup onClose={() => document.getElementById('create-group-modal')?.classList.add('hidden')} onGroupCreated={() => {
            document.getElementById('create-group-modal')?.classList.add('hidden');
            // Refresh groups list
            if (user) {
              const userGroups = store.getUserGroups(user.id);
              setGroups(userGroups);
            }
          }} />
        </div>
      </div>
      
      {selectedGroupId && (
        <GroupSettings
          groupId={selectedGroupId}
          onClose={closeGroupSettings}
        />
      )}
    </div>
  )
} 