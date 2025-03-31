'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { store, User } from '@/lib/store';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on component mount
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
          
          // Rehydrate the store with the user data
          if (userData && userData.id) {
            const fullUser = store.getUser(userData.id);
            if (!fullUser) {
              // If user doesn't exist in store, register it
              // This helps maintain store state across page reloads
              const storedUsers = localStorage.getItem('storeUsers');
              if (storedUsers) {
                try {
                  const users = JSON.parse(storedUsers);
                  users.forEach((user: User) => {
                    if (!store.getUser(user.id)) {
                      store.registerUser(user.name, user.email, user.password, user.image);
                    }
                  });
                } catch (error) {
                  console.error('Failed to parse stored users', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const user = store.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return false;
      }
      
      // Don't store password in the client
      const { password: _, ...safeUser } = user;
      const userWithoutPassword = { ...safeUser, password: undefined };
      
      // Save user to localStorage (only on client)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      }
      
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Check if email already exists
      const existingUser = store.getUserByEmail(email);
      if (existingUser) {
        return false;
      }
      
      // Register new user
      const newUser = store.registerUser(name, email, password);
      
      // Don't store password in the client
      const { password: _, ...safeUser } = newUser;
      const userWithoutPassword = { ...safeUser, password: undefined };
      
      // Save user to localStorage (only on client)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        // Persist store data to survive refresh
        const allUsers = store.getAllUsers();
        localStorage.setItem('storeUsers', JSON.stringify(allUsers));
      }
      
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 