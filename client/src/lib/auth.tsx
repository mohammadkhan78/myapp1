import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (instagramHandle: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (instagramHandle: string) => {
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(instagramHandle)}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('instagramHandle', instagramHandle);
      } else {
        throw new Error('User not found or not verified');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('instagramHandle');
  };

  const refreshUser = async () => {
    const savedHandle = localStorage.getItem('instagramHandle');
    if (savedHandle) {
      try {
        await login(savedHandle);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        logout();
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedHandle = localStorage.getItem('instagramHandle');
      if (savedHandle) {
        try {
          await login(savedHandle);
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
