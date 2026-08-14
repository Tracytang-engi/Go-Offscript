import { apiClient } from './client';
import type { ApiResponse, User } from '../../types';

interface AuthResult {
  user: User;
  token: string;
}

interface RegisterResult {
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export const authApi = {
  register: async (data: { name: string; email: string; password: string }): Promise<RegisterResult> => {
    const r = await apiClient.post<ApiResponse<RegisterResult>>('/auth/register', data);
    return r.data.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResult> => {
    const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/login', data);
    return r.data.data;
  },

  sendOtp: async (email: string): Promise<void> => {
    await apiClient.post('/auth/send-otp', { email });
  },

  verifyOtp: async (email: string, otp: string): Promise<AuthResult> => {
    const r = await apiClient.post<ApiResponse<AuthResult>>('/auth/verify-otp', { email, otp });
    return r.data.data;
  },
};
