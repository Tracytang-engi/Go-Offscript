import { apiClient } from './client';
import type { ApiResponse, User } from '../../types';

interface AuthResult {
  user: User;
  token: string;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<AuthResult> => {
    const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/register', data);
    return r.data.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResult> => {
    const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', data);
    return r.data.data;
  },
};
