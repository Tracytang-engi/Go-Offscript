import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CareerPath, Opportunity } from '../../types';

interface OnboardingState {
  // CV step
  cvId: string | null;
  cvFileName: string | null;
  skills: string[];
  // Social step
  connectedPlatforms: string[];
  // Values step
  selectedValues: string[];
  // Nova chat step
  chatSummary: string;
  // Path step
  careerPath: CareerPath | null;
  likedPaths: string[];
  // Ways In step
  opportunities: Opportunity[];
  opportunityFilter: string;
  // Dashboard: save & completion tracking
  onboardingComplete: boolean;
  savedOpportunityIds: string[];
  completedOpportunityIds: string[];

  setCv: (cvId: string, fileName: string, skills: string[]) => void;
  setSkills: (skills: string[]) => void;
  togglePlatform: (platform: string) => void;
  toggleValue: (valueKey: string) => void;
  setChatSummary: (summary: string) => void;
  appendChatSummary: (extra: string) => void;
  setCareerPath: (path: CareerPath) => void;
  setLikedPaths: (paths: string[]) => void;
  setOpportunities: (opps: Opportunity[]) => void;
  setOpportunityFilter: (filter: string) => void;
  setOnboardingComplete: () => Promise<void>;
  toggleSavedOpp: (id: string) => void;
  markOppComplete: (id: string) => void;
  reset: () => void;
}

const initialState = {
  cvId: null,
  cvFileName: null,
  skills: [],
  connectedPlatforms: [],
  selectedValues: [],
  chatSummary: '',
  careerPath: null,
  likedPaths: [],
  opportunities: [],
  opportunityFilter: 'all',
  onboardingComplete: false,
  savedOpportunityIds: [],
  completedOpportunityIds: [],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setCv: (cvId, cvFileName, skills) => set({ cvId, cvFileName, skills }),
  setSkills: (skills) => set({ skills }),

  togglePlatform: (platform) =>
    set((state) => ({
      connectedPlatforms: state.connectedPlatforms.includes(platform)
        ? state.connectedPlatforms.filter((p) => p !== platform)
        : [...state.connectedPlatforms, platform],
    })),

  toggleValue: (valueKey) =>
    set((state) => ({
      selectedValues: state.selectedValues.includes(valueKey)
        ? state.selectedValues.filter((v) => v !== valueKey)
        : [...state.selectedValues, valueKey],
    })),

  setChatSummary: (chatSummary) => set({ chatSummary }),

  appendChatSummary: (extra) =>
    set((state) => ({
      chatSummary: state.chatSummary
        ? `${state.chatSummary}\n${extra}`
        : extra,
    })),

  setCareerPath: (careerPath) => set({ careerPath }),
  setLikedPaths: (likedPaths) => set({ likedPaths }),
  setOpportunities: (opportunities) => set({ opportunities }),
  setOpportunityFilter: (opportunityFilter) => set({ opportunityFilter }),

  setOnboardingComplete: async () => {
    set({ onboardingComplete: true });
    await AsyncStorage.setItem('onboarding_complete', 'true');
  },

  toggleSavedOpp: (id) =>
    set((state) => ({
      savedOpportunityIds: state.savedOpportunityIds.includes(id)
        ? state.savedOpportunityIds.filter((s) => s !== id)
        : [...state.savedOpportunityIds, id],
    })),

  markOppComplete: (id) =>
    set((state) => ({
      completedOpportunityIds: state.completedOpportunityIds.includes(id)
        ? state.completedOpportunityIds
        : [...state.completedOpportunityIds, id],
    })),

  reset: () => set(initialState),
}));
