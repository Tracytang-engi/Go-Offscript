import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CareerPath, Opportunity, Mentor } from '../../types';
import { meApi, type BootstrapData } from '../api/me.api';

interface OnboardingState {
  cvId: string | null;
  cvFileName: string | null;
  skills: string[];
  connectedPlatforms: string[];
  selectedValues: string[];
  chatSummary: string;
  careerPath: CareerPath | null;
  likedPaths: string[];
  opportunities: Opportunity[];
  opportunityFilter: string;
  onboardingComplete: boolean;
  savedOpportunityIds: string[];
  completedOpportunityIds: string[];
  savedMentors: Mentor[];
  contactedMentorIds: string[];
  profileName: string;
  profileAge: string;
  profileRegion: string;
  profileSchool: string;
  portraitBullets: string[];
  portraitUpdating: boolean;
  /** Settings: persist full Nova chat transcripts on server */
  saveChatHistory: boolean;
  hydrated: boolean;

  setCv: (cvId: string, fileName: string, skills: string[]) => void;
  setSkills: (skills: string[]) => void;
  togglePlatform: (platform: string) => void;
  toggleValue: (valueKey: string) => void;
  setChatSummary: (summary: string) => void;
  appendChatSummary: (extra: string) => void;
  setCareerPath: (path: CareerPath) => void;
  mergeCareerPaths: (newPath: CareerPath) => void;
  setLikedPaths: (paths: string[]) => void;
  addLikedPaths: (newPaths: string[]) => void;
  setOpportunities: (opps: Opportunity[]) => void;
  setOpportunityFilter: (filter: string) => void;
  setOnboardingComplete: () => Promise<void>;
  toggleSavedOpp: (id: string, snapshot?: Opportunity) => void;
  markOppComplete: (id: string) => void;
  unmarkOppComplete: (id: string) => void;
  toggleSavedMentor: (mentor: Mentor) => void;
  toggleMentorContacted: (id: string) => void;
  setProfile: (fields: { name?: string; age?: string; region?: string; school?: string }) => void;
  setPortraitBullets: (bullets: string[]) => void;
  setPortraitUpdating: (val: boolean) => void;
  setMentorMessage: (mentorId: string, message: string) => void;
  setSaveChatHistory: (enabled: boolean) => Promise<void>;
  hydrateFromBootstrap: (data: BootstrapData) => Promise<void>;
  syncPathsToServer: () => void;
  appendChatIfEnabled: (sessionKey: string, role: string, content: string) => void;
  reset: () => void;
}

const initialState = {
  cvId: null as string | null,
  cvFileName: null as string | null,
  skills: [] as string[],
  connectedPlatforms: [] as string[],
  selectedValues: [] as string[],
  chatSummary: '',
  careerPath: null as CareerPath | null,
  likedPaths: [] as string[],
  opportunities: [] as Opportunity[],
  opportunityFilter: 'all',
  onboardingComplete: false,
  savedOpportunityIds: [] as string[],
  completedOpportunityIds: [] as string[],
  savedMentors: [] as Mentor[],
  contactedMentorIds: [] as string[],
  profileName: '',
  profileAge: '',
  profileRegion: '',
  profileSchool: '',
  portraitBullets: [] as string[],
  portraitUpdating: false,
  saveChatHistory: false,
  hydrated: false,
};

const findOppSnapshot = (state: OnboardingState, id: string, snapshot?: Opportunity): Opportunity | undefined => {
  if (snapshot) return snapshot;
  return state.opportunities.find((o) => o.id === id);
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setCv: (cvId, cvFileName, skills) => set({ cvId, cvFileName, skills }),
  setSkills: (skills) => {
    set({ skills });
  },

  togglePlatform: (platform) => {
    set((state) => {
      const connectedPlatforms = state.connectedPlatforms.includes(platform)
        ? state.connectedPlatforms.filter((p) => p !== platform)
        : [...state.connectedPlatforms, platform];
      meApi.updateProfile({ connectedPlatforms });
      return { connectedPlatforms };
    });
  },

  toggleValue: (valueKey) =>
    set((state) => ({
      selectedValues: state.selectedValues.includes(valueKey)
        ? state.selectedValues.filter((v) => v !== valueKey)
        : [...state.selectedValues, valueKey],
    })),

  setChatSummary: (chatSummary) => {
    set({ chatSummary });
    meApi.updateProfile({ chatSummary });
  },

  appendChatSummary: (extra) => {
    const chatSummary = get().chatSummary ? `${get().chatSummary}\n${extra}` : extra;
    set({ chatSummary });
    meApi.updateProfile({ chatSummary });
  },

  setCareerPath: (careerPath) => {
    set({ careerPath });
    meApi.updateProfile({ pathSnapshot: careerPath });
  },

  mergeCareerPaths: (newPath) => {
    set((state) => {
      const existing = state.careerPath;
      if (!existing) {
        meApi.updateProfile({ pathSnapshot: newPath });
        return { careerPath: newPath };
      }
      const existingTitles = new Set(existing.pathScores.map((p) => p.pathTitle));
      const newScores = newPath.pathScores.filter((p) => !existingTitles.has(p.pathTitle));
      const careerPath = {
        ...newPath,
        pathScores: [...existing.pathScores, ...newScores],
      };
      meApi.updateProfile({ pathSnapshot: careerPath });
      return { careerPath };
    });
  },

  setLikedPaths: (likedPaths) => {
    set({ likedPaths });
    const { careerPath } = get();
    const skippedPathTitles =
      careerPath?.pathScores
        .map((p) => p.pathTitle)
        .filter((t) => !likedPaths.includes(t)) ?? [];
    meApi.updateProfile({ likedPathTitles: likedPaths, skippedPathTitles, pathSnapshot: careerPath });
  },

  addLikedPaths: (newPaths) => {
    const likedPaths = Array.from(new Set([...get().likedPaths, ...newPaths]));
    set({ likedPaths });
    const { careerPath } = get();
    const skippedPathTitles =
      careerPath?.pathScores
        .map((p) => p.pathTitle)
        .filter((t) => !likedPaths.includes(t)) ?? [];
    meApi.updateProfile({ likedPathTitles: likedPaths, skippedPathTitles, pathSnapshot: careerPath });
  },

  setOpportunities: (opportunities) => {
    const { savedOpportunityIds, opportunities: existing } = get();
    const byId = new Map(opportunities.map((o) => [o.id, o]));
    for (const o of existing) {
      if (savedOpportunityIds.includes(o.id) && !byId.has(o.id)) {
        byId.set(o.id, o);
      }
    }
    set({ opportunities: Array.from(byId.values()) });
  },
  setOpportunityFilter: (opportunityFilter) => set({ opportunityFilter }),

  setOnboardingComplete: async () => {
    set({ onboardingComplete: true });
    await AsyncStorage.setItem('onboarding_complete', 'true');
    meApi.updateProfile({ onboardingDone: true });
  },

  toggleSavedOpp: (id, snapshot) => {
    const state = get();
    const removing = state.savedOpportunityIds.includes(id);
    const snap = findOppSnapshot(state, id, snapshot);

    if (removing) {
      set({
        savedOpportunityIds: state.savedOpportunityIds.filter((s) => s !== id),
        completedOpportunityIds: state.completedOpportunityIds.filter((c) => c !== id),
      });
      meApi.syncOpportunity({ clientKey: id, remove: true });
      return;
    }

    set({ savedOpportunityIds: [...state.savedOpportunityIds, id] });
    if (snap) {
      meApi.syncOpportunity({ clientKey: id, snapshot: snap, status: 'PENDING' });
    }
  },

  markOppComplete: (id) => {
    set((state) => ({
      completedOpportunityIds: state.completedOpportunityIds.includes(id)
        ? state.completedOpportunityIds
        : [...state.completedOpportunityIds, id],
    }));
    const snap = findOppSnapshot(get(), id);
    if (snap) meApi.syncOpportunity({ clientKey: id, snapshot: snap, status: 'COMPLETED' });
  },

  unmarkOppComplete: (id) => {
    set((state) => ({
      completedOpportunityIds: state.completedOpportunityIds.filter((c) => c !== id),
    }));
    const snap = findOppSnapshot(get(), id);
    if (snap) meApi.syncOpportunity({ clientKey: id, snapshot: snap, status: 'PENDING' });
  },

  setProfile: (fields) => {
    set((state) => ({
      profileName: fields.name !== undefined ? fields.name : state.profileName,
      profileAge: fields.age !== undefined ? fields.age : state.profileAge,
      profileRegion: fields.region !== undefined ? fields.region : state.profileRegion,
      profileSchool: fields.school !== undefined ? fields.school : state.profileSchool,
    }));
    meApi.updateProfile({
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      ...(fields.age !== undefined ? { age: fields.age } : {}),
      ...(fields.region !== undefined ? { region: fields.region } : {}),
      ...(fields.school !== undefined ? { school: fields.school } : {}),
    });
  },

  toggleSavedMentor: (mentor) => {
    const state = get();
    const exists = state.savedMentors.some((m) => m.id === mentor.id);
    if (exists) {
      set({
        savedMentors: state.savedMentors.filter((m) => m.id !== mentor.id),
        contactedMentorIds: state.contactedMentorIds.filter((id) => id !== mentor.id),
      });
      meApi.syncMentor({ clientKey: mentor.id, remove: true });
      return;
    }
    set({ savedMentors: [...state.savedMentors, mentor] });
    meApi.syncMentor({ clientKey: mentor.id, snapshot: mentor, contacted: false });
  },

  toggleMentorContacted: (id) => {
    const state = get();
    const contacted = !state.contactedMentorIds.includes(id);
    set({
      contactedMentorIds: contacted
        ? [...state.contactedMentorIds, id]
        : state.contactedMentorIds.filter((c) => c !== id),
    });
    const mentor = get().savedMentors.find((m) => m.id === id);
    if (mentor) {
      meApi.syncMentor({ clientKey: id, snapshot: mentor, contacted });
    }
  },

  setPortraitBullets: (bullets) => {
    set({ portraitBullets: bullets });
    meApi.updateProfile({ portraitBullets: bullets });
  },

  setPortraitUpdating: (val) => set({ portraitUpdating: val }),

  setMentorMessage: (mentorId, message) => {
    set((state) => ({
      savedMentors: state.savedMentors.map((m) =>
        m.id === mentorId ? { ...m, savedMessage: message } : m
      ),
    }));
    const mentor = get().savedMentors.find((m) => m.id === mentorId);
    if (mentor) {
      meApi.syncMentor({
        clientKey: mentorId,
        snapshot: { ...mentor, savedMessage: message },
        savedMessage: message,
      });
    }
  },

  setSaveChatHistory: async (enabled) => {
    set({ saveChatHistory: enabled });
    await meApi.updateProfile({ saveChatHistory: enabled });
  },

  hydrateFromBootstrap: async (data) => {
    const savedOpps = data.savedOpportunities ?? [];
    const savedMentors = data.savedMentors ?? [];

    const opportunities = savedOpps
      .map((o) => o.snapshot)
      .filter(Boolean) as Opportunity[];

    const mentors = savedMentors.map((m) => ({
      ...(m.snapshot as Mentor),
      id: (m.snapshot as Mentor)?.id ?? m.clientKey,
      savedMessage: m.savedMessage ?? (m.snapshot as Mentor)?.savedMessage,
    }));

    const pathSnapshot = data.profile.pathSnapshot as CareerPath | null;

    set({
      profileName: data.user.name ?? '',
      profileAge: data.profile.age ?? '',
      profileRegion: data.profile.region ?? data.profile.location ?? '',
      profileSchool: data.profile.school ?? '',
      portraitBullets: data.profile.portraitBullets ?? [],
      chatSummary: data.profile.chatSummary ?? '',
      saveChatHistory: data.profile.saveChatHistory ?? false,
      likedPaths: data.profile.likedPathTitles ?? [],
      careerPath: pathSnapshot,
      connectedPlatforms:
        data.profile.connectedPlatforms?.length
          ? data.profile.connectedPlatforms
          : data.socialSignals.filter((s) => s.connected).map((s) => s.platform.toLowerCase()),
      selectedValues: data.values ?? [],
      cvId: data.cv?.id ?? null,
      cvFileName: data.cv?.fileName ?? null,
      skills: data.cv?.skills ?? [],
      onboardingComplete: data.profile.onboardingDone ?? false,
      savedOpportunityIds: savedOpps.map((o) => o.clientKey),
      completedOpportunityIds: savedOpps
        .filter((o) => o.status === 'COMPLETED')
        .map((o) => o.clientKey),
      opportunities,
      savedMentors: mentors,
      contactedMentorIds: savedMentors.filter((m) => m.contacted).map((m) => m.clientKey),
      hydrated: true,
    });

    if (data.profile.onboardingDone) {
      await AsyncStorage.setItem('onboarding_complete', 'true');
    }
  },

  syncPathsToServer: () => {
    const { careerPath, likedPaths } = get();
    const skippedPathTitles =
      careerPath?.pathScores
        .map((p) => p.pathTitle)
        .filter((t) => !likedPaths.includes(t)) ?? [];
    meApi.updateProfile({
      pathSnapshot: careerPath,
      likedPathTitles: likedPaths,
      skippedPathTitles,
    });
  },

  appendChatIfEnabled: (sessionKey, role, content) => {
    if (!get().saveChatHistory) return;
    meApi.appendChat({ sessionKey, role, content });
  },

  reset: () => set({ ...initialState }),
}));
