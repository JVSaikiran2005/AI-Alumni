import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, Profile, UserRole, AuthResponse } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialAuth();
  }, []);

  const loadInitialAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const profile = await apiClient.auth.getProfile();
        setUser(profile);
        setProfile(profile);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profile = await apiClient.auth.getProfile();
      setProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const result = await apiClient.auth.register(email, password, fullName, role);

      if (result.error) {
        return { error: result.error };
      }

      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiClient.auth.login(email, password);

      if (result.error) {
        return { error: result.error };
      }

      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  };

  const signOut = async () => {
    await apiClient.auth.logout();
    setProfile(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const result = await apiClient.auth.updateProfile(updates);
      setProfile(result);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile }}>
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
