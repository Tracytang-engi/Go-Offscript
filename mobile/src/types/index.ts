export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  onboardingDone: boolean;
}

export interface ExtractedSkill {
  id: string;
  skill: string;
  category?: string;
  confidence: number;
}

export interface CvUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  status: 'PROCESSING' | 'DONE' | 'FAILED';
  extractedSkills: ExtractedSkill[];
}

export type ValueKey =
  | 'financial_security'
  | 'creativity'
  | 'making_impact'
  | 'discovery'
  | 'community'
  | 'work_life_balance'
  | 'growth_and_status'
  | 'building_things';

export interface Value {
  id: string;
  key: ValueKey;
  label: string;
  emoji?: string;
}

export interface PathScore {
  id: string;
  pathTitle: string;
  matchScore: number;
  label?: string;
  emoji?: string;
  rank: number;
}

export interface CareerPath {
  id: string;
  primaryPath: string;
  secondaryPath?: string;
  explanation: string;
  tensionNote?: string;
  nextActions: string[];
  pathScores: PathScore[];
}

export type OpportunityType = 'INTERNSHIP' | 'FELLOWSHIP' | 'SHORT_PROJECT' | 'COACHING' | 'MEETUP';
export type FilterType = 'all' | 'opps' | 'coaching' | 'meet';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  type: OpportunityType;
  deadline?: string;
  isOpen: boolean;
  url?: string | null;     // real application link
  tags: string[];
  peerCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
