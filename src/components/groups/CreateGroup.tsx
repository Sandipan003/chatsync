'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { store, User } from '@/lib/store';
import { useNotification } from '@/components/notifications/NotificationProvider';

interface CreateGroupProps {
  onClose?: () => void;
  onGroupCreated?: () => void;
}

export default function CreateGroup({ onClose, onGroupCreated }: CreateGroupProps) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [availableFriends, setAvailableFriends] = useState<User[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  // Fetch available friends when the component mounts
  React.useEffect(() => {
    if (user) {
      const friends = store.getUserFriends(user.id);
      setAvailableFriends(friends);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!name.trim()) {
      addNotification('Group name is required', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const group = store.createGroup(
        name,
        user.id,
        [user.id, ...selectedFriends], // Include current user and selected friends
        description
      );
      
      addNotification(`Group "${name}" created successfully`, 'success');
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedFriends([]);
      setShowFriendSelector(false);
      
      // Call the callback function if provided
      if (onGroupCreated) {
        onGroupCreated();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      addNotification('Failed to create group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-900 dark:bg-gray-800 rounded-lg shadow-lg p-5 border border-slate-800">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="group-name" className="block text-sm font-medium text-gray-300 mb-2">
            Group Name
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter group name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="group-description" className="block text-sm font-medium text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            id="group-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter group description"
          ></textarea>
        </div>
        
        {/* Friends selection */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowFriendSelector(!showFriendSelector)}
            className="text-sm text-blue-400 hover:text-blue-300 mb-2 flex items-center"
          >
            <span>{showFriendSelector ? 'Hide friend selector' : 'Add friends to group'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-4 w-4 transition-transform ${showFriendSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showFriendSelector && (
            <div className="mt-2 p-2 bg-slate-800 rounded-md">
              {availableFriends.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">You don't have any friends to add yet</p>
              ) : (
                <div className="max-h-40 overflow-y-auto">
                  {availableFriends.map(friend => (
                    <label key={friend.id} className="flex items-center p-2 hover:bg-slate-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFriends.includes(friend.id)}
                        onChange={() => toggleFriendSelection(friend.id)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs overflow-hidden mr-2">
                          {friend.image ? (
                            <img src={friend.image} alt={friend.name} className="h-full w-full object-cover" />
                          ) : (
                            friend.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm text-white">{friend.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Selected: {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-white font-medium rounded-md ${
            loading ? 'bg-blue-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
} 