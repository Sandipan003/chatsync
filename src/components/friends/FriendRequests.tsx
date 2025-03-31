'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { store, User } from '@/lib/store';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { useRouter } from 'next/navigation';

type LocalNotification = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

export default function FriendRequests() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [localNotification, setLocalNotification] = useState<LocalNotification | null>(null);
  const [acceptedFriend, setAcceptedFriend] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  // Clear local notification after 3 seconds
  useEffect(() => {
    if (localNotification) {
      const timer = setTimeout(() => {
        setLocalNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [localNotification]);

  const loadRequests = () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const requests = store.getPendingRequests(user.id);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const showLocalNotification = (message: string, type: 'success' | 'error') => {
    // Clear any existing notification first
    setLocalNotification(null);
    
    // Small timeout to ensure animation plays properly when consecutive notifications appear
    setTimeout(() => {
      setLocalNotification({
        id: Date.now().toString(),
        message,
        type
      });
    }, 10);
  };

  // Add a function to dismiss notification
  const dismissNotification = () => {
    setLocalNotification(null);
  };

  const handleAccept = (requesterId: string) => {
    if (!user) return;
    
    try {
      const success = store.acceptFriendRequest(user.id, requesterId);
      if (success) {
        // Find the requester's name
        const requester = pendingRequests.find(r => r.id === requesterId);
        if (requester) {
          // Show both local and global notification
          showLocalNotification(`You are now friends with ${requester.name}!`, 'success');
          addNotification(`You are now friends with ${requester.name}!`, 'success');
          
          // Save the accepted friend to state
          setAcceptedFriend(requester);
          
          // Refresh the requests list
          loadRequests();
        }
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      showLocalNotification('Failed to accept friend request', 'error');
      addNotification('Failed to accept friend request', 'error');
    }
  };

  const handleReject = (requesterId: string) => {
    if (!user) return;
    
    try {
      const success = store.rejectFriendRequest(user.id, requesterId);
      if (success) {
        // Find the requester's name
        const requester = pendingRequests.find(r => r.id === requesterId);
        if (requester) {
          showLocalNotification(`Friend request from ${requester.name} declined`, 'success');
        }
        // Refresh the requests list
        loadRequests();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      showLocalNotification('Failed to decline friend request', 'error');
      addNotification('Failed to decline friend request', 'error');
    }
  };

  // Function to start conversation with newly accepted friend
  const startConversation = (friendId: string) => {
    try {
      // Find or create conversation with this friend
      const conversations = store.getUserConversations(user!.id);
      let conversation = conversations.find(c => 
        c.participants.length === 2 && 
        c.participants.includes(friendId)
      );
      
      // If no conversation exists, create one
      if (!conversation) {
        conversation = store.createConversation([user!.id, friendId]);
      }
      
      // Clear the accepted friend state
      setAcceptedFriend(null);
      
      // Redirect to home page which will show the chat interface
      router.push('/');
      
      // Add a small delay to ensure the state is updated in the home page
      setTimeout(() => {
        try {
          // Dispatch an event to notify the home page to select this chat
          const event = new CustomEvent('selectChat', { 
            detail: { chatId: conversation!.id }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Failed to dispatch selectChat event:', error);
        }
      }, 100);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      addNotification('Failed to start conversation', 'error');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-900 dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 border border-slate-800 w-full max-w-md mx-auto md:mx-0 relative overflow-hidden">
      {/* Local Notification */}
      {localNotification && (
        <div className="mb-4 overflow-hidden">
          <div className={`rounded-lg shadow-lg p-3 text-white transform transition-all duration-300 ${
            localNotification.type === 'success' 
              ? 'bg-gradient-to-r from-green-500/90 to-green-600/90 border border-green-400/30' 
              : 'bg-gradient-to-r from-red-500/90 to-red-600/90 border border-red-400/30'
          } animate-slide-in flex items-center`}>
            {localNotification.type === 'success' ? (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-medium flex-1">{localNotification.message}</p>
            <button 
              onClick={dismissNotification}
              className="ml-2 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Accepted Friend Card */}
      {acceptedFriend && (
        <div className="mb-4 bg-gradient-to-r from-blue-600/90 to-blue-700/90 rounded-lg p-4 shadow-lg border border-blue-500/30 animate-slide-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0">
              {acceptedFriend.image ? (
                <img 
                  src={acceptedFriend.image} 
                  alt={acceptedFriend.name} 
                  className="h-full w-full object-cover rounded-full border-2 border-blue-400/50" 
                />
              ) : (
                <span>{acceptedFriend.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">{acceptedFriend.name}</h3>
              <p className="text-xs text-blue-100/80">Friend request accepted</p>
            </div>
          </div>
          <p className="text-sm text-white/90 mb-3">
            You and {acceptedFriend.name} are now friends! Start a conversation now.
          </p>
          <button
            onClick={() => startConversation(acceptedFriend.id)}
            className="w-full py-2.5 rounded-md bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            Start Conversation
          </button>
          <button 
            onClick={() => setAcceptedFriend(null)}
            className="mt-2 w-full py-1.5 text-sm rounded-md bg-transparent text-white/80 hover:bg-blue-600/50 transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-3 md:mb-4 pb-2 md:pb-3 border-b border-slate-700/50">Friend Requests</h2>
      
      {loading ? (
        <div className="text-center py-6 md:py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 md:py-8 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium">No pending friend requests</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pendingRequests.map((requester) => (
            <li 
              key={requester.id} 
              className="relative p-2 md:p-3 bg-slate-800/70 dark:bg-gray-700/70 rounded-lg hover:bg-slate-700/70 transition-all duration-200 border border-slate-700/30"
            >
              {/* User info with proper spacing */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md flex-shrink-0">
                  {requester.image ? (
                    <img 
                      src={requester.image} 
                      alt={requester.name} 
                      className="h-full w-full object-cover rounded-full border-2 border-slate-600" 
                    />
                  ) : (
                    <span className="transform text-sm">{requester.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white tracking-wide truncate">{requester.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{requester.email}</p>
                </div>
              </div>
              
              {/* Buttons below the email */}
              <div className="flex gap-2 justify-end mt-3 w-full">
                <button
                  onClick={() => handleAccept(requester.id)}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 transition-colors duration-200 min-w-[90px]"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(requester.id)}
                  className="px-3 py-1.5 text-sm font-medium rounded bg-slate-700 text-slate-200 hover:bg-slate-600 active:bg-slate-800 transition-colors duration-200 min-w-[90px]"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 