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
  // Path step
  careerPath: CareerPath | null;
  // Ways In step
  opportunities: Opportunity[];
  opportunityFilter: string;

  setCv: (cvId: string, fileName: string, skills: string[]) => void;
  setSkills: (skills: string[]) => void;
  togglePlatform: (platform: string) => void;
  toggleValue: (valueKey: string) => void;
  setCareerPath: (path: CareerPath) => void;
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
  careerPath: null,
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

  setCareerPath: (careerPath) => set({ careerPath }),
  setOpportunities: (opportunities) => set({ opportunities }),
  setOpportunityFilter: (opportunityFilter) => set({ opportunityFilter }),
  reset: () => set(initialState),
}));
