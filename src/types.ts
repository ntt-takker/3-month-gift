export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'chat'
  | 'memories'
  | 'todos'
  | 'mood'
  | 'compliments'
  | 'media'
  | 'games'
  | 'settings';

export type PartnerId = 'partner1' | 'partner2';

export interface PartnerProfile {
  id: PartnerId;
  name: string;
  nickname: string;
  nicknameSetBy: PartnerId;
  birthday: string;
  avatar: string;
  bio?: string;
}

export interface CoupleProfile {
  [key: string]: any;
  partner1: PartnerProfile;
  partner2: PartnerProfile;
  anniversaryDate: string;
  passcode: string;
  passcodeHint: string;
  partner1Passcode?: string;
  partner1PasscodeHint?: string;
  partner2Passcode?: string;
  partner2PasscodeHint?: string;
  currentViewer: PartnerId;
  ambientSoundEnabled?: boolean;
  darkMode?: boolean;
}

export interface Compliment {
  id: string;
  from: PartnerId;
  to: PartnerId;
  text?: string;
  content: string;
  category?: string;
  timestamp: number;
  relationshipDay?: number;
  isFavorite?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  type?: string;
  category?: 'anniversary' | 'date' | 'trip' | 'special' | string;
  badge?: string;
  description?: string;
  note?: string;
  icon?: string;
  photoUrl?: string;
}

export interface PhotoMemory {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  addedAt: number;
  addedBy?: PartnerId;
  isFavorite?: boolean;
}

export interface ToDoItem {
  id: string;
  title: string;
  category?: string;
  assignedTo?: PartnerId | 'both';
  addedBy?: PartnerId;
  dueDate?: string;
  completed: boolean;
  completedAt?: number;
  completedNote?: string;
  addedAt: number;
}

export interface DailyMood {
  emoji?: string;
  statusText?: string;
  updatedAt?: number;
  lastPoke?: {
    type: 'hug' | 'kiss' | 'love';
    from: PartnerId;
    timestamp: number;
  };
}

export interface LoveDrop {
  id: string;
  from: PartnerId;
  to?: PartnerId;
  type?: string;
  title?: string;
  message?: string;
  content?: string;
  timestamp: number;
  revealDate?: string;
  isRevealed?: boolean;
  isSurprise?: boolean;
  heartCount: number;
  photoUrl?: string;
}

export interface MediaRecommendation {
  id: string;
  title: string;
  category: 'song' | 'movie' | 'book' | 'spot';
  suggestedBy: PartnerId;
  creator?: string;
  note?: string;
  url?: string;
  status: 'pending' | 'completed' | 'to_experience';
  rating?: number;
  sharedReview?: string;
  suggestedAt: number;
}

export type GameMode = 'apart' | 'public' | 'dark';

export interface TruthOrDareCard {
  id: string;
  type: 'truth' | 'dare';
  mode: GameMode;
  intensity?: 1 | 2 | 3;
  prompt: string;
  isCustom?: boolean;
  addedBy?: PartnerId;
}

export interface SharedSpotifyPlaylist {
  title: string;
  description: string;
  url: string;
  playlistUrl?: string;
  embedUrl: string;
  updatedBy?: PartnerId;
  updatedAt?: number;
}

export interface ChatMessage {
  id: string;
  from: PartnerId;
  text: string;
  timestamp: number;
  isSticker?: boolean;
  reaction?: string;
}
