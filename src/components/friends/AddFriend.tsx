'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { store } from '@/lib/store';
import { useNotification } from '@/components/notifications/NotificationProvider';

interface AddFriendProps {
  onClose?: () => void;
}

export default function AddFriend({ onClose }: AddFriendProps) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Find user by email
      const targetUser = store.getUserByEmail(email);
      
      if (!targetUser) {
        addNotification('User not found', 'error');
        return;
      }
      
      // Check if this is the current user
      if (targetUser.id === user.id) {
        addNotification('You cannot add yourself as a friend', 'error');
        return;
      }
      
      // Check if already a friend
      if (user.friends.includes(targetUser.id)) {
        addNotification('This user is already your friend', 'info');
        return;
      }
      
      // Check if friend request already sent
      if (user.sentRequests.includes(targetUser.id)) {
        addNotification('Friend request already sent', 'info');
        return;
      }
      
      // Send friend request
      const success = store.sendFriendRequest(user.id, targetUser.id);
      
      if (success) {
        addNotification(`Friend request sent to ${targetUser.name}`, 'success');
        setEmail('');
        if (onClose) onClose();
      } else {
        addNotification('Failed to send friend request', 'error');
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      addNotification('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-900 dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-slate-800">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Friend's Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your friend's email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            loading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
        >
          {loading ? 'Sending...' : 'Send Friend Request'}
        </button>
      </form>
    </div>
  );
} 