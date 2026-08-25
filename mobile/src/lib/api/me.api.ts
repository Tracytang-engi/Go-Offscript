import { apiClient } from './client';
import type { ApiResponse, CareerPath, Mentor, Opportunity } from '../../types';

export type BootstrapData = {
  user: { id: string; name: string; email: string };
  profile: {
    age: string | null;
    school: string | null;
    region: string | null;
    location: string | null;
    portraitBullets: string[];
    chatSummary: string | null;
    saveChatHistory: boolean;
    likedPathTitles: string[];
    skippedPathTitles: string[];
    pathSnapshot: CareerPath | null;
    connectedPlatforms: string[];
    onboardingDone: boolean;
  };
  cv: { id: string; fileName: string; skills: string[] } | null;
  values: string[];
  socialSignals: Array<{ platform: string; summary: string | null; connected: boolean }>;
  savedOpportunities: Array<{ clientKey: string; snapshot: Opportunity; status: string }>;
  savedMentors: Array<{
    clientKey: string;
    snapshot: Mentor;
    contacted: boolean;
    savedMessage: string | null;
  }>;
  chatMessages: Array<{ sessionKey: string; role: string; content: string; createdAt: string }>;
};

const quiet = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch {
    // best-effort sync — never block UI
  }
};

export const meApi = {
  bootstrap: async (): Promise<BootstrapData | null> => {
    try {
      const r = await apiClient.get<ApiResponse<BootstrapData>>('/users/me/bootstrap', {
        timeout: 30000,
      });
      return r.data.data;
    } catch {
      return null;
    }
  },

  updateProfile: (body: Record<string, unknown>) =>
    quiet(() => apiClient.patch('/users/me/profile', body)),

  syncOpportunity: (body: {
    clientKey: string;
    snapshot?: Opportunity;
    status?: string;
    remove?: boolean;
  }) => quiet(() => apiClient.post('/users/me/saved-opportunities', body)),

  syncMentor: (body: {
    clientKey: string;
    snapshot?: Mentor;
    contacted?: boolean;
    savedMessage?: string;
    remove?: boolean;
  }) => quiet(() => apiClient.post('/users/me/saved-mentors', body)),

  appendChat: (body: { sessionKey: string; role: string; content: string }) =>
    quiet(() => apiClient.post('/users/me/chat-messages', body)),
};
