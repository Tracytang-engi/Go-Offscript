export interface SocialSignalItem {
  platform: string;
  summary?: string | null;
}

export interface PathItem {
  title: string;
  description: string;
  matchScore: number; // 0-100
}

export interface NovaInput {
  userId: string;
  skills: string[];
  values: string[];
  socialSignals?: SocialSignalItem[];
  cvSummary?: string;
}

export interface NovaOutput {
  primaryPath: PathItem;
  secondaryPath?: PathItem;
  tertiaryPath?: PathItem;
  tensionNote: string;
  nextActions: string[];
  opportunities: RecommendedOpportunity[];
  explanation: string;
}

export interface RecommendedOpportunity {
  title: string;
  organization: string;
  type: string;
  description: string;
  deadline?: string;
}
