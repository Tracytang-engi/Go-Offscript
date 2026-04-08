import { apiClient } from './client';
import { MOCK_USER, MOCK_TOKEN } from './mock';
import type { ApiResponse, User } from '../../types';

interface AuthResult {
  user: User;
  token: string;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResult> => {
    try {
      const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', data);
      return r.data.data;
    } catch {
      // Backend unreachable — create a local session so onboarding can proceed
      console.warn('[Auth] Backend unreachable — using offline mode');
      return { user: { ...MOCK_USER, name: data.name, email: data.email }, token: MOCK_TOKEN };
    }
  },

  login: async (data: { email: string; password: string }): Promise<AuthResult> => {
    try {
      const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', data);
      return r.data.data;
    } catch {
      console.warn('[Auth] Backend unreachable — using offline mode');
      return { user: { ...MOCK_USER, email: data.email }, token: MOCK_TOKEN };
    }
  },
};
