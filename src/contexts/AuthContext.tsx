import { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, UserRole } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const userId = `user_${Date.now()}`;
      const newProfile: Profile = {
        id: userId,
        email,
        full_name: fullName,
        user_role: role,
        is_verified: false,
        verification_badge: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser({ id: userId, email });
      setProfile(newProfile);
      return { error: null };
    } catch (error) {
      return { error: String(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userId = `user_${Date.now()}`;
      const mockProfile: Profile = {
        id: userId,
        email,
        full_name: 'Demo User',
        user_role: 'alumni',
        is_verified: true,
        verification_badge: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser({ id: userId, email });
      setProfile(mockProfile);
      return { error: null };
    } catch (error) {
      return { error: String(error) };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
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
