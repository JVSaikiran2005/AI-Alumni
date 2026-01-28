const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  created_at?: string;
  updated_at?: string;
  user_details?: UserDetails;
}

export interface UserDetails {
  id?: string;
  user_id?: string;
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

export interface AuthResponse {
  success?: boolean;
  user?: Profile;
  token?: string;
  error?: string;
}

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  },

  auth: {
    async register(email: string, password: string, fullName: string, role: UserRole): Promise<AuthResponse> {
      const data = await apiClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    },

    async login(email: string, password: string): Promise<AuthResponse> {
      const data = await apiClient.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      return data;
    },

    async logout() {
      localStorage.removeItem('auth_token');
    },

    async getProfile(): Promise<Profile> {
      return apiClient.request('/api/auth/profile');
    },

    async updateProfile(updates: Partial<Profile>): Promise<Profile> {
      return apiClient.request('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    getToken() {
      return localStorage.getItem('auth_token');
    },

    async verifyToken(token: string) {
      try {
        localStorage.setItem('auth_token', token);
        const profile = await apiClient.auth.getProfile();
        return { valid: true, profile };
      } catch {
        localStorage.removeItem('auth_token');
        return { valid: false };
      }
    },
  },

  skills: {
    async getAll(): Promise<any> {
      return apiClient.request('/api/skills');
    },

    async add(name: string, category?: string): Promise<any> {
      return apiClient.request('/api/skills', {
        method: 'POST',
        body: JSON.stringify({ name, category }),
      });
    },
  },

  ai: {
    async generateMatches(): Promise<any> {
      return apiClient.request('/api/ai/generate-matches', {
        method: 'POST',
      });
    },

    async getMatches(): Promise<any> {
      return apiClient.request('/api/ai/matches');
    },

    async getCareerInsights(): Promise<any> {
      return apiClient.request('/api/ai/career-insights');
    },
  },

  mentorship: {
    async requestSession(alumniId: string, title: string, description?: string, durationMinutes?: number): Promise<any> {
      return apiClient.request('/api/mentorship', {
        method: 'POST',
        body: JSON.stringify({
          alumni_id: alumniId,
          title,
          description,
          duration_minutes: durationMinutes,
        }),
      });
    },
  },

  jobs: {
    async getAll(): Promise<any> {
      return apiClient.request('/api/jobs');
    },

    async post(job: any): Promise<any> {
      return apiClient.request('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(job),
      });
    },
  },

  admin: {
    async getVerifications(): Promise<any> {
      return apiClient.request('/api/admin/verifications');
    },

    async approveVerification(verificationId: string, action: 'approve' | 'reject', notes?: string): Promise<any> {
      return apiClient.request(`/api/admin/verifications/${verificationId}`, {
        method: 'PUT',
        body: JSON.stringify({ action, notes }),
      });
    },

    async getStats(): Promise<any> {
      return apiClient.request('/api/admin/stats');
    },
  },
};

export type Supabase = typeof apiClient;

export const supabase = {
  auth: {
    signUp: ({ email, password }: { email: string; password: string }) => ({
      data: { user: { id: '' } },
      error: null,
    }),
    signInWithPassword: ({ email, password }: { email: string; password: string }) =>
      apiClient.auth.login(email, password),
    signOut: () => apiClient.auth.logout(),
    getSession: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return { data: { session: null } };

      try {
        const profile = await apiClient.auth.getProfile();
        return {
          data: {
            session: {
              access_token: token,
              user: profile,
            },
          },
        };
      } catch {
        return { data: { session: null } };
      }
    },
    onAuthStateChange: (callback: any) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.auth.getProfile().then((profile) => {
          callback('SIGNED_IN', { access_token: token, user: profile });
        });
      }

      return { unsubscribe: () => {} };
    },
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: null }) }),
      order: () => ({ limit: () => ({ eq: () => ({ data: [] }) }) }),
    }),
    insert: () => ({ data: null }),
    upsert: () => ({ onConflict: () => null }),
    delete: () => ({ eq: () => null }),
    update: () => ({ eq: () => null }),
  }),
} as any;
