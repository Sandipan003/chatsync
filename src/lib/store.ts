import { v4 as uuidv4 } from 'uuid';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  image?: string;
  friends: string[]; // Array of user IDs
  pendingRequests: string[]; // Array of user IDs
  sentRequests: string[]; // Array of user IDs
  groups: string[]; // Array of group IDs
};

export type Message = {
  id: string;
  senderId: string;
  content: string;
  timestamp: number; // Unix timestamp
  readBy: string[]; // Array of user IDs
  reactions?: { 
    emoji: string;
    count: number;
    users: string[];
  }[]; // Optional array of reactions
};

export type Conversation = {
  id: string;
  participants: string[]; // Array of user IDs
  messages: Message[];
  lastActivity: number;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  creatorId: string;
  admins: string[]; // Array of user IDs who are admins
  members: string[]; // Array of user IDs
  messages: Message[];
  lastActivity: number;
};

// Mock data store
class Store {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private groups: Map<string, Group> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Load users
      const usersJson = localStorage.getItem('storeUsers');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        users.forEach((user: User) => {
          this.users.set(user.id, user);
        });
      }

      // Load conversations
      const conversationsJson = localStorage.getItem('storeConversations');
      if (conversationsJson) {
        const conversations = JSON.parse(conversationsJson);
        conversations.forEach((conversation: Conversation) => {
          this.conversations.set(conversation.id, conversation);
        });
      }

      // Load groups
      const groupsJson = localStorage.getItem('storeGroups');
      if (groupsJson) {
        const groups = JSON.parse(groupsJson);
        groups.forEach((group: Group) => {
          this.groups.set(group.id, group);
        });
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      // Save users
      localStorage.setItem('storeUsers', JSON.stringify(Array.from(this.users.values())));
      
      // Save conversations
      localStorage.setItem('storeConversations', JSON.stringify(Array.from(this.conversations.values())));
      
      // Save groups
      localStorage.setItem('storeGroups', JSON.stringify(Array.from(this.groups.values())));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // User methods
  registerUser(name: string, email: string, password: string, image?: string): User {
    const id = uuidv4();
    const user: User = {
      id,
      name,
      email,
      password, // Should be hashed in real app
      image,
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      groups: []
    };
    
    this.users.set(id, user);
    this.saveToStorage();
    return user;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Friend request methods
  sendFriendRequest(senderId: string, receiverId: string): boolean {
    const sender = this.users.get(senderId);
    const receiver = this.users.get(receiverId);
    
    if (!sender || !receiver) return false;
    
    // Check if already sent or if already friends
    if (
      sender.sentRequests.includes(receiverId) ||
      receiver.pendingRequests.includes(senderId) ||
      sender.friends.includes(receiverId)
    ) {
      return false;
    }
    
    sender.sentRequests.push(receiverId);
    receiver.pendingRequests.push(senderId);
    
    this.users.set(senderId, sender);
    this.users.set(receiverId, receiver);
    
    this.saveToStorage();
    return true;
  }

  acceptFriendRequest(userId: string, requesterId: string): boolean {
    const user = this.users.get(userId);
    const requester = this.users.get(requesterId);
    
    if (!user || !requester) return false;
    
    // Check if request exists
    if (
      !user.pendingRequests.includes(requesterId) ||
      !requester.sentRequests.includes(userId)
    ) {
      return false;
    }
    
    // Remove from pending/sent requests
    user.pendingRequests = user.pendingRequests.filter(id => id !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id !== userId);
    
    // Add to friends
    user.friends.push(requesterId);
    requester.friends.push(userId);
    
    // Create a conversation between them
    this.createConversation([userId, requesterId]);
    
    this.users.set(userId, user);
    this.users.set(requesterId, requester);
    
    this.saveToStorage();
    return true;
  }

  rejectFriendRequest(userId: string, requesterId: string): boolean {
    const user = this.users.get(userId);
    const requester = this.users.get(requesterId);
    
    if (!user || !requester) return false;
    
    // Remove from pending/sent requests
    user.pendingRequests = user.pendingRequests.filter(id => id !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id !== userId);
    
    this.users.set(userId, user);
    this.users.set(requesterId, requester);
    
    this.saveToStorage();
    return true;
  }

  getUserFriends(userId: string): User[] {
    const user = this.users.get(userId);
    if (!user) return [];
    
    return user.friends.map(friendId => this.users.get(friendId)).filter(Boolean) as User[];
  }

  getPendingRequests(userId: string): User[] {
    const user = this.users.get(userId);
    if (!user) return [];
    
    return user.pendingRequests
      .map(requesterId => this.users.get(requesterId))
      .filter(Boolean) as User[];
  }

  // Conversation methods
  createConversation(participantIds: string[]): Conversation {
    const id = uuidv4();
    const conversation: Conversation = {
      id,
      participants: participantIds,
      messages: [],
      lastActivity: Date.now()
    };
    
    this.conversations.set(id, conversation);
    this.saveToStorage();
    return conversation;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getUserConversations(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(conversation => conversation.participants.includes(userId));
  }

  // Message methods
  sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Message | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;
    
    const message: Message = {
      id: uuidv4(),
      senderId,
      content,
      timestamp: Date.now(),
      readBy: [senderId],
      reactions: []
    };
    
    conversation.messages.push(message);
    conversation.lastActivity = message.timestamp;
    
    this.conversations.set(conversationId, conversation);
    this.saveToStorage();
    return message;
  }

  // Group methods
  createGroup(
    name: string,
    creatorId: string,
    memberIds: string[] = [],
    description?: string,
    image?: string
  ): Group {
    const id = uuidv4();
    const members = [creatorId, ...memberIds];
    
    const group: Group = {
      id,
      name,
      description,
      image,
      creatorId,
      admins: [creatorId],
      members,
      messages: [],
      lastActivity: Date.now()
    };
    
    this.groups.set(id, group);
    
    // Add group to members' groups
    members.forEach(memberId => {
      const user = this.users.get(memberId);
      if (user) {
        user.groups.push(id);
        this.users.set(memberId, user);
      }
    });
    
    this.saveToStorage();
    return group;
  }

  getGroup(id: string): Group | undefined {
    return this.groups.get(id);
  }

  getUserGroups(userId: string): Group[] {
    return Array.from(this.groups.values())
      .filter(group => group.members.includes(userId));
  }

  addMemberToGroup(groupId: string, userId: string): boolean {
    const group = this.groups.get(groupId);
    const user = this.users.get(userId);
    
    if (!group || !user) return false;
    if (group.members.includes(userId)) return false;
    
    group.members.push(userId);
    user.groups.push(groupId);
    
    this.groups.set(groupId, group);
    this.users.set(userId, user);
    
    this.saveToStorage();
    return true;
  }

  makeGroupAdmin(groupId: string, adminId: string, userId: string): boolean {
    const group = this.groups.get(groupId);
    
    if (!group) return false;
    if (!group.members.includes(userId)) return false;
    if (!group.admins.includes(adminId)) return false;
    if (group.admins.includes(userId)) return false;
    
    group.admins.push(userId);
    this.groups.set(groupId, group);
    
    this.saveToStorage();
    return true;
  }

  sendGroupMessage(
    groupId: string,
    senderId: string,
    content: string
  ): Message | null {
    const group = this.groups.get(groupId);
    if (!group || !group.members.includes(senderId)) return null;
    
    const message: Message = {
      id: uuidv4(),
      senderId,
      content,
      timestamp: Date.now(),
      readBy: [senderId],
      reactions: []
    };
    
    group.messages.push(message);
    group.lastActivity = message.timestamp;
    
    this.groups.set(groupId, group);
    this.saveToStorage();
    return message;
  }
}

// Create and export a singleton instance
export const store = new Store(); 