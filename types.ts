export enum AppState {
  CONNECT_WALLET,
  CREATE_PROFILE_NAME,
  DASHBOARD,
  SETUP,
  STUDYING,
  SUMMARY,
  MARKETPLACE,
  PROFILE,
  COMMUNITY,
  HISTORY,
  LEARN_BASE,
  SUBSCRIPTION,
  STAKING,
  TOKEN_SHOP,
  REWARD_DASHBOARD,
}

export enum TutorRole {
  EXPLAINER = "Explainer",
  QUIZ_MASTER = "Quiz Master",
  SKEPTIC = "Skeptic",
  SUMMARIZER = "Summarizer",
}

export interface Tutor {
  id: string;
  name: string;
  gender: 'male' | 'female';
  role: TutorRole;
  description: string;
  avatarUrl: string;
  voiceColor: string;
}

export enum SessionStatus {
    Idle = "Idle",
    Connecting = "Connecting",
    Connected = "Connected",
    Error = "Error",
    Ended = "Ended"
}

export interface TranscriptEntry {
    speaker: string;
    text: string;
}

export type VoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export type UserSubscription = 'free' | 'premium';

export interface UserProfile {
  address: string;
  bns: string;
  balance: number;
  subscription: UserSubscription;
  profilePictureUrl?: string;
  school?: string;
  major?: string;
  year?: number;
}

export interface NFTCredential {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  date: string;
  transactionHash: string;
  isOfficial?: boolean;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  creatorBns: string;
  price: number;
  imageUrl: string;
  creatorRoyaltyPercent: number;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  userVote: 'for' | 'against' | null;
  endsIn: string;
}

export interface PastSession {
  id:string;
  topic: string;
  date: string;
  durationInSeconds: number;
  transcript: string;
  summary?: string;
  audioRecordingUrl?: string;
}

export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // ISO string
  notified: boolean;
}

export interface BaseLearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
}