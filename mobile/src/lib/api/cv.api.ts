import { apiClient } from './client';
import type { ApiResponse, CvUpload, ExtractedSkill } from '../../types';

export interface CvUploadResult {
  cvId: string;
  skills: string[];
  fileUrl: string;
  isReal: boolean;      // false = backend unreachable, skills are placeholders
  errorMessage?: string;
}

export const cvApi = {
  upload: async (formData: FormData): Promise<CvUploadResult> => {
    try {
      const r = await apiClient.post<ApiResponse<{ cvId: string; skills: string[]; fileUrl: string }>>(
        '/cv/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
      );
      return { ...r.data.data, isReal: true };
    } catch (e) {
      const msg = (e as Error).message ?? '';
      const isAuth = msg.includes('401') || msg.toLowerCase().includes('auth');
      return {
        cvId: 'local-cv',
        skills: [],
        fileUrl: '',
        isReal: false,
        errorMessage: isAuth
          ? 'session issue — please log out and sign in again to enable CV analysis'
          : 'couldn\'t reach server — skills will be analysed once connected',
      };
    }
  },

  getLatest: async (): Promise<CvUpload> => {
    const r = await apiClient.get<ApiResponse<CvUpload>>('/cv/latest');
    return r.data.data;
  },

  getSkills: async (cvId: string): Promise<ExtractedSkill[]> => {
    try {
      const r = await apiClient.get<ApiResponse<ExtractedSkill[]>>(`/cv/${cvId}/skills`);
      return r.data.data;
    } catch {
      return [];
    }
  },
};
