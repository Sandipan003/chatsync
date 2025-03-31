'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { store, Group, User } from '@/lib/store';

interface GroupSettingsProps {
  groupId: string;
  onClose: () => void;
}

export default function GroupSettings({ groupId, onClose }: GroupSettingsProps) {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Add member states
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableFriends, setAvailableFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>('');

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = () => {
    setLoading(true);
    
    try {
      const groupData = store.getGroup(groupId);
      
      if (!groupData) {
        setError('Group not found');
        return;
      }
      
      setGroup(groupData);
      
      // Get available friends to add
      if (user) {
        const userFriends = store.getUserFriends(user.id);
        // Filter friends who are not already in the group
        const availableFriendsToAdd = userFriends.filter(
          (friend) => !groupData.members.includes(friend.id)
        );
        setAvailableFriends(availableFriendsToAdd);
      }
    } catch (error) {
      console.error('Failed to load group:', error);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = (memberId: string) => {
    if (!user || !group) return;
    
    try {
      const success = store.makeGroupAdmin(group.id, user.id, memberId);
      
      if (success) {
        setSuccess('User is now an admin');
        loadGroup(); // Refresh group data
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError('Failed to make user an admin');
      }
    } catch (error) {
      console.error('Failed to make admin:', error);
      setError('An unexpected error occurred');
    }
  };

  const addMember = () => {
    if (!user || !group || !selectedFriend) return;
    
    try {
      const success = store.addMemberToGroup(group.id, selectedFriend);
      
      if (success) {
        setSuccess('Member added successfully');
        setShowAddMember(false);
        setSelectedFriend('');
        loadGroup(); // Refresh group data
        
        // Clear success message after a delay
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError('Failed to add member');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
          <div className="p-6">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading group details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group || !user) {
    return null;
  }

  const isCurrentUserAdmin = group.admins.includes(user.id);
  const isCurrentUserCreator = group.creatorId === user.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{group.name} - Group Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded mb-4">
              <p>{success}</p>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Group Information</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Created by:</span>{' '}
                {store.getUser(group.creatorId)?.name || 'Unknown'}
              </p>
              {group.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium">Description:</span> {group.description}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-medium">Members:</span> {group.members.length}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Members</h3>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  {showAddMember ? 'Cancel' : 'Add Member'}
                </button>
              )}
            </div>
            
            {showAddMember && (
              <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add a friend to this group</h4>
                
                {availableFriends.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No friends available to add to this group.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={selectedFriend}
                      onChange={(e) => setSelectedFriend(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      aria-label="Select friend to add"
                    >
                      <option value="">Select a friend</option>
                      {availableFriends.map((friend) => (
                        <option key={friend.id} value={friend.id}>
                          {friend.name}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={addMember}
                      disabled={!selectedFriend}
                      className="px-3 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Group
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded">
              <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                {group.members.map((memberId) => {
                  const member = store.getUser(memberId);
                  if (!member) return null;
                  
                  const isAdmin = group.admins.includes(memberId);
                  const isCreator = group.creatorId === memberId;
                  
                  return (
                    <li key={memberId} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-200 font-semibold text-sm overflow-hidden">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                            {isCreator && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                                Creator
                              </span>
                            )}
                            {isAdmin && !isCreator && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                                Admin
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {isCurrentUserAdmin && !isAdmin && !isCreator && (
                        <button
                          onClick={() => makeAdmin(memberId)}
                          className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500"
                        >
                          Make Admin
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 