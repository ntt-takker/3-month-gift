import {
  CoupleProfile,
  Compliment,
  Milestone,
  PhotoMemory,
  ToDoItem,
  DailyMood,
  LoveDrop,
  MediaRecommendation,
  TruthOrDareCard,
  PartnerId,
  SharedSpotifyPlaylist,
  ChatMessage,
} from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'us_couple_profile',
  COMPLIMENTS: 'us_couple_compliments',
  MILESTONES: 'us_couple_milestones',
  PHOTOS: 'us_couple_photos',
  TODOS: 'us_couple_todos',
  MOODS: 'us_couple_moods',
  LOVE_DROPS: 'us_couple_lovedrops',
  RECOMMENDATIONS: 'us_couple_recommendations',
  TRUTH_OR_DARE: 'us_couple_truthordare',
  PLAYLIST: 'us_couple_playlist',
  CHAT: 'us_couple_chat',
};

export const initialProfile: CoupleProfile = {
  partner1: {
    id: 'partner1',
    name: 'Manil',
    nickname: 'My Handsome Goofball',
    nicknameSetBy: 'partner2',
    birthday: '2006-09-20',
    avatar: '🧸',
    bio: 'Hopelessly in love with Sanjana ❤️',
  },
  partner2: {
    id: 'partner2',
    name: 'Sanjana',
    nickname: 'My Sweet Angel',
    nicknameSetBy: 'partner1',
    birthday: '2005-11-10',
    avatar: '🌸',
    bio: 'Forever Manil’s favorite person ✨',
  },
  anniversaryDate: '2026-08-01',
  passcode: '2010',
  passcodeHint: 'Our birthdate',
  partner1Passcode: '1214',
  partner1PasscodeHint: 'My Handsome Goofball’s birthday PIN (1214)',
  partner2Passcode: '0418',
  partner2PasscodeHint: 'My Sweet Angel’s birthday PIN (0418)',
  currentViewer: 'partner1',
  ambientSoundEnabled: false,
  darkMode: false,
};

export const initialCompliments: Compliment[] = [
  {
    id: 'c-1',
    from: 'partner1',
    to: 'partner2',
    content: 'Your laugh is literally my favorite sound in the entire world. It turns any stressful day into magic.',
    text: 'Your laugh is literally my favorite sound in the entire world. It turns any stressful day into magic.',
    category: 'smile',
    timestamp: Date.now() - 86400000 * 5,
    relationshipDay: 85,
    isFavorite: true,
  },
  {
    id: 'c-2',
    from: 'partner2',
    to: 'partner1',
    content: 'I love how safe and cherished you make me feel every single time you hold my hand.',
    text: 'I love how safe and cherished you make me feel every single time you hold my hand.',
    category: 'love',
    timestamp: Date.now() - 86400000 * 3,
    relationshipDay: 87,
    isFavorite: true,
  },
  {
    id: 'c-3',
    from: 'partner1',
    to: 'partner2',
    content: 'You inspire me every day with your kindness, your intelligence, and your sweet heart.',
    text: 'You inspire me every day with your kindness, your intelligence, and your sweet heart.',
    category: 'personality',
    timestamp: Date.now() - 86400000,
    relationshipDay: 89,
    isFavorite: false,
  },
];

export const initialMilestones: Milestone[] = [
  {
    id: 'm-1',
    title: 'The Day We Started Dating',
    date: '2026-08-01',
    category: 'anniversary',
    note: 'The best decision of our lives. Where forever began.',
    icon: '💖',
  },
  {
    id: 'm-2',
    title: 'Our 1st Month Anniversary',
    date: '2026-09-01',
    category: 'anniversary',
    note: 'One month of endless smiles and butterflies.',
    icon: '✨',
  },
  {
    id: 'm-3',
    title: 'Our 2nd Month Anniversary',
    date: '2026-10-01',
    category: 'anniversary',
    note: 'Growing deeper in love each passing second.',
    icon: '🥂',
  },
  {
    id: 'm-4',
    title: 'Our 3rd Month Anniversary',
    date: '2026-11-01',
    category: 'anniversary',
    note: '90 days of unconditional love and our digital sanctuary.',
    icon: '🎉',
  },
];

export const initialPhotos: PhotoMemory[] = [
  {
    id: 'p-1',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    caption: 'Our cozy evening talking about our future together ✨',
    date: '2026-08-15',
    location: 'Cozy Corner Cafe',
    addedAt: Date.now() - 86400000 * 60,
    isFavorite: true,
  },
  {
    id: 'p-2',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunset stroll where time completely stood still ❤️',
    date: '2026-09-20',
    location: 'Lakeside Walk',
    addedAt: Date.now() - 86400000 * 30,
    isFavorite: true,
  },
];

export const initialTodos: ToDoItem[] = [
  {
    id: 't-1',
    title: 'Stargazing picnic with hot cocoa and blankets',
    category: 'dates',
    assignedTo: 'both',
    addedBy: 'partner1',
    dueDate: '2026-11-15',
    completed: false,
    addedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 't-2',
    title: 'Cook homemade pasta together from scratch',
    category: 'dates',
    assignedTo: 'both',
    addedBy: 'partner2',
    dueDate: '2026-11-20',
    completed: true,
    completedAt: Date.now() - 86400000 * 2,
    completedNote: 'It was delicious and so messy! Best night ever 🍝',
    addedAt: Date.now() - 86400000 * 14,
  },
  {
    id: 't-3',
    title: 'Plan our winter weekend cabin getaway',
    category: 'travel',
    assignedTo: 'both',
    addedBy: 'partner1',
    dueDate: '2026-12-05',
    completed: false,
    addedAt: Date.now() - 86400000 * 5,
  },
];

export const initialMoods: Record<PartnerId, DailyMood> = {
  partner1: {
    emoji: '🥰',
    statusText: 'Thinking about you every single minute',
    updatedAt: Date.now(),
  },
  partner2: {
    emoji: '🌸',
    statusText: 'Feeling blessed and so loved today',
    updatedAt: Date.now(),
  },
};

export const initialLoveDrops: LoveDrop[] = [
  {
    id: 'ld-1',
    from: 'partner1',
    title: 'A whisper for when you miss me',
    message: 'Whenever you feel lonely, just remember that across any distance, my heart beats entirely for you.',
    timestamp: Date.now() - 86400000 * 2,
    heartCount: 12,
    isRevealed: true,
  },
  {
    id: 'ld-2',
    from: 'partner2',
    title: 'Open when you need a smile',
    message: 'You make the ordinary moments feel extraordinary. I am so lucky you are mine.',
    timestamp: Date.now() - 86400000,
    heartCount: 8,
    isRevealed: true,
  },
];

export const initialRecommendations: MediaRecommendation[] = [
  {
    id: 'rec-1',
    title: 'About Time (2013)',
    category: 'movie',
    suggestedBy: 'partner1',
    creator: 'Richard Curtis',
    note: 'The most beautiful movie about appreciating every single day with the one you love.',
    url: 'https://www.imdb.com/title/tt2194499/',
    status: 'completed',
    rating: 5,
    sharedReview: 'We both cried and held each other so tight.',
    suggestedAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'rec-2',
    title: 'Lover',
    category: 'song',
    suggestedBy: 'partner2',
    creator: 'Taylor Swift',
    note: 'Reminds me of us dancing together in the kitchen.',
    url: 'https://open.spotify.com/track/1dGr1nsAZkt7oPakVDuhoR',
    status: 'pending',
    suggestedAt: Date.now() - 86400000 * 10,
  },
];

export const initialTruthOrDare: TruthOrDareCard[] = [
  {
    id: 'tod-1',
    type: 'truth',
    mode: 'apart',
    intensity: 1,
    prompt: 'What was the exact moment you realized you had real feelings for me?',
  },
  {
    id: 'tod-2',
    type: 'dare',
    mode: 'public',
    intensity: 1,
    prompt: 'Give me a sneaky kiss while nobody is looking.',
  },
  {
    id: 'tod-3',
    type: 'truth',
    mode: 'apart',
    intensity: 2,
    prompt: 'What is a sweet habit of mine that secretly makes your heart melt?',
  },
  {
    id: 'tod-4',
    type: 'dare',
    mode: 'dark',
    intensity: 2,
    prompt: 'Send a 15-second voice note describing your favorite kiss we ever shared.',
  },
];

export const initialPlaylist: SharedSpotifyPlaylist = {
  title: 'MS Verse — Our Love Soundtrack',
  description: 'Our handpicked acoustic & romantic love songs, updated together.',
  url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  playlistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
  embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator',
};

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    from: 'partner1',
    text: 'Happy 3 months my love! Welcome to our private universe ❤️',
    timestamp: Date.now() - 86400000,
    isSticker: false,
  },
  {
    id: 'msg-2',
    from: 'partner2',
    text: 'I love it so much! Happy 3rd month anniversary, my handsome goofball 🥰',
    timestamp: Date.now() - 86400000 + 120000,
    isSticker: false,
  },
];

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

export function exportAllData(): string {
  const exportPayload: Record<string, unknown> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const val = localStorage.getItem(key);
      if (val) exportPayload[name] = JSON.parse(val);
    } catch {}
  });
  return JSON.stringify(exportPayload, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') return false;
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (parsed[name] !== undefined) {
        localStorage.setItem(key, JSON.stringify(parsed[name]));
      }
    });
    return true;
  } catch {
    return false;
  }
}

export function getRelationshipDays(startDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const now = new Date();
    // Reset hours to midnight for exact day delta
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffMs = now.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(days, 1);
  } catch {
    return 1;
  }
}

export interface ActiveMilestoneCelebration {
  badge: string;
  title: string;
  subtitle: string;
}

export function checkIsMilestoneToday(
  anniversaryDateStr: string,
  nowDate: Date | number = new Date(),
  milestones: Milestone[] = []
): ActiveMilestoneCelebration | null {
  try {
    const anniv = new Date(anniversaryDateStr);
    const dateObj = typeof nowDate === 'number' ? new Date(nowDate) : nowDate;
    const isSameDayMonth = anniv.getDate() === dateObj.getDate() && anniv.getMonth() === dateObj.getMonth();
    const isMonthlyDay = anniv.getDate() === dateObj.getDate();

    if (isSameDayMonth) {
      const years = dateObj.getFullYear() - anniv.getFullYear();
      return {
        badge: 'Happy Anniversary!',
        title: years > 0 ? `Happy ${years} Year Anniversary!` : 'Our Love Sanctuary Anniversary!',
        subtitle: 'Another magical chapter together. Celebrating every moment since forever began.',
      };
    }

    if (isMonthlyDay) {
      return {
        badge: 'Monthly Anniversary',
        title: 'Happy Monthly Love Milestone!',
        subtitle: 'Another month of butterflies, endless memories, and true love.',
      };
    }

    const dateStr = dateObj.toISOString().slice(0, 10);
    const matched = milestones.find((m) => m.date === dateStr);
    if (matched) {
      return {
        badge: matched.badge || 'Special Milestone',
        title: matched.title,
        subtitle: matched.description || matched.note || 'A special moment in our love story.',
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  const seen = new Set<string>();
  const res: ChatMessage[] = [];
  for (const m of messages) {
    if (m && m.id && !seen.has(m.id)) {
      seen.add(m.id);
      res.push(m);
    }
  }
  return res;
}

export function formatSpotifyEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  try {
    // Match /playlist/ID, /track/ID, /album/ID
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  } catch {
    return url;
  }
}
