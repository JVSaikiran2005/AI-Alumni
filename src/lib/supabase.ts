import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'alumni' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  user_role: UserRole;
  avatar_url?: string;
  bio?: string;
  is_verified: boolean;
  verification_badge: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDetails {
  id: string;
  user_id: string;
  institute?: string;
  degree?: string;
  major?: string;
  graduation_year?: number;
  current_company?: string;
  job_title?: string;
  experience_years?: number;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  available_for_mentorship: boolean;
  can_provide_referrals: boolean;
  preferred_communication?: string[];
  achievements?: any[];
}
