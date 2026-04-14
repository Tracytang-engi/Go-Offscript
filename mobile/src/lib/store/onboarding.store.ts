import { create } from 'zustand';
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
  // Nova chat step — summary of extra context the user shared
  chatSummary: string;
  // Path step
  careerPath: CareerPath | null;
  likedPaths: string[];   // titles of cards the user swiped right on
  // Ways In step
  opportunities: Opportunity[];
  opportunityFilter: string;

  setCv: (cvId: string, fileName: string, skills: string[]) => void;
  setSkills: (skills: string[]) => void;
  togglePlatform: (platform: string) => void;
  toggleValue: (valueKey: string) => void;
  setChatSummary: (summary: string) => void;
  setCareerPath: (path: CareerPath) => void;
  setLikedPaths: (paths: string[]) => void;
  setOpportunities: (opps: Opportunity[]) => void;
  setOpportunityFilter: (filter: string) => void;
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
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
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
  setCareerPath: (careerPath) => set({ careerPath }),
  setLikedPaths: (likedPaths) => set({ likedPaths }),
  setOpportunities: (opportunities) => set({ opportunities }),
  setOpportunityFilter: (opportunityFilter) => set({ opportunityFilter }),
  reset: () => set(initialState),
}));
