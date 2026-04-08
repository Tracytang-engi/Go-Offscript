import { apiClient } from './client';
import { MOCK_VALUES, MOCK_PATH, MOCK_OPPORTUNITIES } from './mock';
import type { ApiResponse, Value, CareerPath, Opportunity } from '../../types';

// ─── Values ───────────────────────────────────────────────────────────────────

export const valuesApi = {
  getAll: async (): Promise<Value[]> => {
    try {
      const r = await apiClient.get<ApiResponse<Value[]>>('/values/all');
      return r.data.data.length > 0 ? r.data.data : MOCK_VALUES;
    } catch {
      return MOCK_VALUES;
    }
  },

  save: async (values: string[]): Promise<void> => {
    try {
      await apiClient.post('/values', { values });
    } catch {
      // Best-effort — don't block the user
    }
  },
};

// ─── Social Signals ───────────────────────────────────────────────────────────

export interface SocialAnalysis {
  topics: string[];
  industries: string[];
  vibes: string[];
  summary: string;
}

export const socialApi = {
  uploadScreenshot: async (
    platform: string,
    imageUri?: string,
    description?: string
  ): Promise<{ signal: unknown; analysis?: SocialAnalysis }> => {
    try {
      const form = new FormData();
      form.append('platform', platform);
      if (description) form.append('description', description);
      if (imageUri) {
        const filename = imageUri.split('/').pop() ?? 'screenshot.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        form.append('screenshot', {
          uri: imageUri,
          name: filename,
          type: ext === 'png' ? 'image/png' : 'image/jpeg',
        } as unknown as Blob);
      }
      const r = await apiClient.post<ApiResponse<{ signal: unknown; analysis?: SocialAnalysis }>>(
        '/social/signals',
        form,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
      );
      return r.data.data;
    } catch {
      // Return a minimal mock so the UI marks platform as done
      return {
        signal: {},
        analysis: {
          topics: description ? [description] : [],
          industries: [],
          vibes: [],
          summary: description ?? `${platform} signal saved`,
        },
      };
    }
  },

  getAll: async (): Promise<unknown[]> => {
    try {
      const r = await apiClient.get<ApiResponse<unknown[]>>('/social/signals');
      return r.data.data;
    } catch {
      return [];
    }
  },
};

// ─── Career Path ──────────────────────────────────────────────────────────────

export interface PathResult {
  path: CareerPath;
  isReal: boolean;         // false = Nova was unreachable, showing fallback
  errorMessage?: string;
}

export const pathApi = {
  generate: async (clientData?: {
    skills?: string[];
    values?: string[];
    socialSignals?: Array<{ platform: string; summary?: string }>;
  }): Promise<PathResult> => {
    try {
      const r = await apiClient.post<ApiResponse<{
        primaryPath: { title: string; description: string; matchScore: number };
        secondaryPath?: { title: string; description: string; matchScore: number };
        tertiaryPath?: { title: string; description: string; matchScore: number };
        tensionNote: string;
        nextActions: string[];
        explanation: string;
      }>>('/nova/analyze', clientData ?? {});
      const d = r.data.data;
      const path: CareerPath = {
        id: 'nova-' + Date.now(),
        primaryPath: d.primaryPath.title,
        secondaryPath: d.secondaryPath?.title,
        explanation: d.explanation,
        tensionNote: d.tensionNote,
        nextActions: d.nextActions,
        pathScores: [
          { id: '1', pathTitle: d.primaryPath.title, matchScore: d.primaryPath.matchScore, label: 'your sweet spot', rank: 1 },
          ...(d.secondaryPath ? [{ id: '2', pathTitle: d.secondaryPath.title, matchScore: d.secondaryPath.matchScore, label: 'strong match', rank: 2 }] : []),
          ...(d.tertiaryPath ? [{ id: '3', pathTitle: d.tertiaryPath.title, matchScore: d.tertiaryPath.matchScore, label: 'passion signal 🔥', rank: 3 }] : []),
        ],
      };
      return { path, isReal: true };
    } catch (e) {
      const msg = (e as Error).message ?? '';
      const isAuth = msg.includes('401') || msg.includes('unauthorized') || msg.toLowerCase().includes('auth');
      return {
        path: MOCK_PATH,
        isReal: false,
        errorMessage: isAuth
          ? 'session expired — please log out and sign in again'
          : 'nova couldn\'t reach the server — showing a sample path',
      };
    }
  },

  getLatest: async (): Promise<PathResult> => {
    try {
      const r = await apiClient.get<ApiResponse<CareerPath>>('/path/latest');
      return { path: r.data.data, isReal: true };
    } catch {
      return { path: MOCK_PATH, isReal: false };
    }
  },
};

// ─── Opportunities ────────────────────────────────────────────────────────────

const FILTER_MAP: Record<string, string[]> = {
  all: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT', 'COACHING', 'MEETUP'],
  opps: ['INTERNSHIP', 'FELLOWSHIP', 'SHORT_PROJECT'],
  coaching: ['COACHING'],
  meet: ['MEETUP'],
};

export const opportunityApi = {
  getAll: async (filter = 'all', page = 1): Promise<{ opportunities: Opportunity[]; total: number; hasMore: boolean }> => {
    try {
      const r = await apiClient.get<ApiResponse<{ opportunities: Opportunity[]; total: number; hasMore: boolean }>>(
        `/opportunities?type=${filter}&page=${page}`
      );
      const d = r.data.data;
      return d.opportunities.length > 0 ? d : { opportunities: filterMockOpps(filter), total: 5, hasMore: false };
    } catch {
      return { opportunities: filterMockOpps(filter), total: 5, hasMore: false };
    }
  },
};

const filterMockOpps = (filter: string): Opportunity[] => {
  const types = FILTER_MAP[filter] ?? FILTER_MAP.all;
  return MOCK_OPPORTUNITIES.filter((o) => types.includes(o.type));
};
