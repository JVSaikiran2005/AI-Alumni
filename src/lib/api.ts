const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.detail || 'An error occurred',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Network error',
      status: 0,
    };
  }
}

export interface SyncUserPayload {
  firebase_uid: string;
  email: string;
  full_name: string;
  role: 'student' | 'alumni' | 'admin';
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const api = {
  health: () => apiCall('/health'),
  syncUser: (payload: SyncUserPayload) =>
    apiCall('/users/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  aiChat: (userId: string, messages: ChatMessage[]) =>
    apiCall<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, messages }),
    }),
};
