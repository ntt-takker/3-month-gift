/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Heart } from 'lucide-react';

import {
  ActiveTab,
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
} from './types';

import {
  STORAGE_KEYS,
  initialProfile,
  initialCompliments,
  initialMilestones,
  initialPhotos,
  initialTodos,
  initialMoods,
  initialLoveDrops,
  initialRecommendations,
  initialTruthOrDare,
  initialPlaylist,
  initialChatMessages,
  loadFromStorage,
  saveToStorage,
  exportAllData,
  importAllData,
  getRelationshipDays,
  deduplicateMessages,
} from './utils/storage';

import { soundEngine } from './utils/audio';
import { syncService } from './utils/syncService';

import PasscodeLock from './components/PasscodeLock';
import NavigationDrawer from './components/NavigationDrawer';

import DashboardView from './components/views/DashboardView';
import CalendarView from './components/views/CalendarView';
import MemoriesView from './components/views/MemoriesView';
import ToDoView from './components/views/ToDoView';
import MoodNotesView from './components/views/MoodNotesView';
import ComplimentVaultView from './components/views/ComplimentVaultView';
import MediaCornerView from './components/views/MediaCornerView';
import TruthOrDareView from './components/views/TruthOrDareView';
import SettingsView from './components/views/SettingsView';
import { ChatView } from './components/views/ChatView';
import MobileWidgetsStudio from './components/MobileWidgetsStudio';

export default function App() {
  // App Lock State: user requested app asks for passcode every time opened or resumed from background
  const [isLocked, setIsLocked] = useState(true);

  // Active Tab: check URL parameter for direct PWA shortcut launcher
  const [currentTab, setCurrentTab] = useState<ActiveTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      const validTabs: ActiveTab[] = [
        'dashboard',
        'calendar',
        'chat',
        'memories',
        'todos',
        'mood',
        'compliments',
        'media',
        'games',
        'settings',
      ];
      if (tabParam && validTabs.includes(tabParam)) {
        return tabParam;
      }
    } catch {
      // ignore
    }
    return 'dashboard';
  });

  // Mobile Widgets Studio Modal
  const [isWidgetStudioOpen, setIsWidgetStudioOpen] = useState(false);

  // Ambient sound toggle
  const [ambientSound, setAmbientSound] = useState(false);

  // Floating notification / toast for pokes (hugs, kisses)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Domain states with local persistence
  const [profile, setProfile] = useState<CoupleProfile>(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile)
  );
  const [compliments, setCompliments] = useState<Compliment[]>(() =>
    loadFromStorage(STORAGE_KEYS.COMPLIMENTS, initialCompliments)
  );
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    loadFromStorage(STORAGE_KEYS.MILESTONES, initialMilestones)
  );
  const [photos, setPhotos] = useState<PhotoMemory[]>(() =>
    loadFromStorage(STORAGE_KEYS.PHOTOS, initialPhotos)
  );
  const [todos, setTodos] = useState<ToDoItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.TODOS, initialTodos)
  );
  const [moods, setMoods] = useState<Record<PartnerId, DailyMood>>(() =>
    loadFromStorage(STORAGE_KEYS.MOODS, initialMoods)
  );
  const [loveDrops, setLoveDrops] = useState<LoveDrop[]>(() =>
    loadFromStorage(STORAGE_KEYS.LOVE_DROPS, initialLoveDrops)
  );
  const [recommendations, setRecommendations] = useState<MediaRecommendation[]>(() =>
    loadFromStorage(STORAGE_KEYS.RECOMMENDATIONS, initialRecommendations)
  );
  const [truthOrDare, setTruthOrDare] = useState<TruthOrDareCard[]>(() =>
    loadFromStorage(STORAGE_KEYS.TRUTH_OR_DARE, initialTruthOrDare)
  );
  const [playlist, setPlaylist] = useState<SharedSpotifyPlaylist>(() =>
    loadFromStorage(STORAGE_KEYS.PLAYLIST, initialPlaylist)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    deduplicateMessages(loadFromStorage(STORAGE_KEYS.CHAT, initialChatMessages))
  );

  // Initialize 24/7 Real-Time Synchronization
  useEffect(() => {
    syncService.init();

    const unsubscribe = syncService.subscribe((event) => {
      if (event.type === 'SYNC_FULL_STATE' && event.payload) {
        if (event.payload.chat) setChatMessages(deduplicateMessages(event.payload.chat));
        if (event.payload.playlist) setPlaylist(event.payload.playlist);
        if (event.payload.compliments) setCompliments(event.payload.compliments);
        if (event.payload.todos) setTodos(event.payload.todos);
        if (event.payload.moods) setMoods(event.payload.moods);
        if (event.payload.photos) setPhotos(event.payload.photos);
      } else if (event.type === 'STATE_UPDATED' && event.payload) {
        if (event.payload.playlist) setPlaylist(event.payload.playlist);
        if (event.payload.compliments) setCompliments(event.payload.compliments);
        if (event.payload.todos) setTodos(event.payload.todos);
        if (event.payload.moods) setMoods(event.payload.moods);
        if (event.payload.photos) setPhotos(event.payload.photos);
        if (event.payload.loveDrops) setLoveDrops(event.payload.loveDrops);
        if (event.payload.chat) setChatMessages(deduplicateMessages(event.payload.chat));
      } else if (event.type === 'CHAT_MESSAGE_RECEIVED' && event.payload) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === event.payload.id)) return prev;
          return deduplicateMessages([...prev, event.payload]);
        });

        // If message is from partner, notify
        if (event.payload.from !== profile.currentViewer) {
          soundEngine.playMessageReceived();
          const sender = profile[event.payload.from as PartnerId];
          triggerToast(`💌 ${sender.name}: ${event.payload.text}`);
        }
      } else if (event.type === 'POKE_RECEIVED' && event.payload) {
        if (event.payload.to === profile.currentViewer) {
          const sender = profile[event.payload.from as PartnerId];
          if (event.payload.pokeType === 'kiss') {
            soundEngine.playKissSound();
            triggerToast(`💋 ${sender.name} sent you a sweet kiss!`);
          } else if (event.payload.pokeType === 'hug') {
            soundEngine.playHugSound();
            triggerToast(`🫂 ${sender.name} sent you a warm hug!`);
          } else {
            soundEngine.playSuccess();
            triggerToast(`💖 ${sender.name} sent you love!`);
          }

          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.6 },
            colors: ['#e11d48', '#fda4af', '#fb7185'],
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [profile.currentViewer]);

  // Dark Mode synchronization with HTML element
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.darkMode]);

  const handleToggleDarkMode = () => {
    soundEngine.playBubblePop();
    setProfile((prev) => {
      const updated = { ...prev, darkMode: !prev.darkMode };
      syncService.sendStateUpdate('profile', updated);
      return updated;
    });
  };

  // Save to storage automatically
  useEffect(() => saveToStorage(STORAGE_KEYS.PROFILE, profile), [profile]);
  useEffect(() => saveToStorage(STORAGE_KEYS.COMPLIMENTS, compliments), [compliments]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MILESTONES, milestones), [milestones]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PHOTOS, photos), [photos]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TODOS, todos), [todos]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MOODS, moods), [moods]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LOVE_DROPS, loveDrops), [loveDrops]);
  useEffect(() => saveToStorage(STORAGE_KEYS.RECOMMENDATIONS, recommendations), [recommendations]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TRUTH_OR_DARE, truthOrDare), [truthOrDare]);
  useEffect(() => saveToStorage(STORAGE_KEYS.PLAYLIST, playlist), [playlist]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CHAT, chatMessages), [chatMessages]);

  // CRITICAL REQUIREMENT: Re-lock when app goes to background / tab is switched / minimized
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ambient sound controller
  const handleToggleAmbient = () => {
    const nextState = !ambientSound;
    setAmbientSound(nextState);
    soundEngine.toggleAmbientMusic(nextState);
  };

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Pokes (Hug, Kiss, Love)
  const handleSendPoke = (type: 'hug' | 'kiss' | 'love') => {
    const receiver = profile.currentViewer === 'partner1' ? profile.partner2 : profile.partner1;
    const receiverId: PartnerId = profile.currentViewer === 'partner1' ? 'partner2' : 'partner1';

    if (type === 'kiss') {
      soundEngine.playKissSound();
      triggerToast(`💋 Sent a sweet kiss to ${receiver.name}!`);
    } else if (type === 'hug') {
      soundEngine.playHugSound();
      triggerToast(`🫂 Sent a warm, tight hug to ${receiver.name}!`);
    } else {
      soundEngine.playSuccess();
      triggerToast(`💖 Sent an overflowing burst of love to ${receiver.name}!`);
    }

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af', '#fb7185'],
    });

    syncService.sendPoke(profile.currentViewer, receiverId, type);

    // Update target's lastPoke in moods
    setMoods((prev) => {
      const updated = {
        ...prev,
        [receiverId]: {
          ...prev[receiverId],
          lastPoke: {
            type,
            from: profile.currentViewer,
            timestamp: Date.now(),
          },
        },
      };
      syncService.sendStateUpdate('moods', updated);
      return updated;
    });
  };

  // Chat handlers
  const handleSendMessage = (text: string, isSticker?: boolean) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: profile.currentViewer,
      text,
      timestamp: Date.now(),
      isSticker,
    };

    setChatMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return deduplicateMessages([...prev, newMsg]);
    });
    syncService.sendChatMessage(newMsg);
  };

  const handleReactMessage = (msgId: string, emoji: string) => {
    setChatMessages((prev) => {
      const updated = prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m));
      syncService.sendStateUpdate('chat', updated);
      return updated;
    });
  };

  // Spotify Playlist handler
  const handleUpdatePlaylist = (updatedPlaylist: SharedSpotifyPlaylist) => {
    setPlaylist(updatedPlaylist);
    syncService.sendStateUpdate('playlist', updatedPlaylist);
    triggerToast('Shared Spotify playlist updated! 🎶');
  };

  // Memories handlers
  const handleAddPhoto = (newPhoto: Omit<PhotoMemory, 'id' | 'addedAt'>) => {
    const photo: PhotoMemory = {
      ...newPhoto,
      id: `p-${Date.now()}`,
      addedAt: Date.now(),
    };
    setPhotos((prev) => {
      const updated = [photo, ...prev];
      syncService.sendStateUpdate('photos', updated);
      return updated;
    });
  };

  const handleTogglePhotoFavorite = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
      syncService.sendStateUpdate('photos', updated);
      return updated;
    });
  };

  const handleAddMilestone = (newMilestone: Omit<Milestone, 'id'>) => {
    const milestone: Milestone = {
      ...newMilestone,
      id: `m-${Date.now()}`,
    };
    setMilestones((prev) => {
      const updated = [...prev, milestone];
      syncService.sendStateUpdate('milestones', updated);
      return updated;
    });
  };

  const handleUpdateMilestone = (updated: Milestone) => {
    setMilestones((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      syncService.sendStateUpdate('milestones', next);
      return next;
    });
  };

  // Todo handlers
  const handleAddTodo = (newTodo: Omit<ToDoItem, 'id' | 'addedAt' | 'completed'>) => {
    const item: ToDoItem = {
      ...newTodo,
      id: `td-${Date.now()}`,
      addedAt: Date.now(),
      completed: false,
    };
    setTodos((prev) => {
      const updated = [item, ...prev];
      syncService.sendStateUpdate('todos', updated);
      return updated;
    });
  };

  const handleToggleTodo = (id: string, completedNote?: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
            completedNote: nextCompleted ? completedNote : undefined,
          };
        }
        return t;
      });
      syncService.sendStateUpdate('todos', updated);
      return updated;
    });
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      syncService.sendStateUpdate('todos', updated);
      return updated;
    });
  };

  // Mood handlers
  const handleUpdateMood = (partner: PartnerId, emoji: string, statusText: string) => {
    setMoods((prev) => {
      const updated = {
        ...prev,
        [partner]: {
          ...prev[partner],
          emoji,
          statusText,
          updatedAt: Date.now(),
        },
      };
      syncService.sendStateUpdate('moods', updated);
      return updated;
    });
  };

  // Love Drop handlers
  const handleAddLoveDrop = (
    drop: Omit<LoveDrop, 'id' | 'timestamp' | 'heartCount' | 'isRevealed'>
  ) => {
    const newDrop: LoveDrop = {
      ...drop,
      id: `ld-${Date.now()}`,
      timestamp: Date.now(),
      heartCount: 1,
      isRevealed: !drop.isSurprise,
    };
    setLoveDrops((prev) => {
      const updated = [newDrop, ...prev];
      syncService.sendStateUpdate('loveDrops', updated);
      return updated;
    });
  };

  const handleRevealDrop = (id: string) => {
    setLoveDrops((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, isRevealed: true } : d));
      syncService.sendStateUpdate('loveDrops', updated);
      return updated;
    });
  };

  const handleReactDrop = (id: string) => {
    setLoveDrops((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, heartCount: d.heartCount + 1 } : d));
      syncService.sendStateUpdate('loveDrops', updated);
      return updated;
    });
  };

  // Compliments handlers
  const handleAddCompliment = (
    c: Omit<Compliment, 'id' | 'timestamp' | 'relationshipDay'>
  ) => {
    const days = getRelationshipDays(profile.anniversaryDate);
    const newCompliment: Compliment = {
      ...c,
      id: `c-${Date.now()}`,
      timestamp: Date.now(),
      relationshipDay: days,
    };
    setCompliments((prev) => {
      const updated = [newCompliment, ...prev];
      syncService.sendStateUpdate('compliments', updated);
      return updated;
    });
  };

  const handleToggleFavoriteCompliment = (id: string) => {
    setCompliments((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
      syncService.sendStateUpdate('compliments', updated);
      return updated;
    });
  };

  const handleDeleteCompliment = (id: string) => {
    setCompliments((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      syncService.sendStateUpdate('compliments', updated);
      return updated;
    });
  };

  // Recommendations handlers
  const handleAddRecommendation = (
    rec: Omit<MediaRecommendation, 'id' | 'suggestedAt'>
  ) => {
    const newRec: MediaRecommendation = {
      ...rec,
      id: `rec-${Date.now()}`,
      suggestedAt: Date.now(),
    };
    setRecommendations((prev) => {
      const updated = [newRec, ...prev];
      syncService.sendStateUpdate('recommendations', updated);
      return updated;
    });
  };

  const handleUpdateRecommendationStatus = (
    id: string,
    status: MediaRecommendation['status'],
    rating?: number,
    sharedReview?: string
  ) => {
    setRecommendations((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              rating: rating !== undefined ? rating : r.rating,
              sharedReview: sharedReview !== undefined ? sharedReview : r.sharedReview,
            }
          : r
      );
      syncService.sendStateUpdate('recommendations', updated);
      return updated;
    });
  };

  // Truth or Dare handlers
  const handleAddCustomCard = (card: Omit<TruthOrDareCard, 'id' | 'isCustom'>) => {
    const newCard: TruthOrDareCard = {
      ...card,
      id: `tod-custom-${Date.now()}`,
      isCustom: true,
    };
    setTruthOrDare((prev) => {
      const updated = [newCard, ...prev];
      syncService.sendStateUpdate('truthOrDare', updated);
      return updated;
    });
  };

  // Backup handlers
  const handleExportBackup = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `us_our_forever_space_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Backup downloaded successfully! ✨');
  };

  const handleImportBackup = (jsonStr: string) => {
    const ok = importAllData(jsonStr);
    if (ok) {
      setProfile(loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile));
      setCompliments(loadFromStorage(STORAGE_KEYS.COMPLIMENTS, initialCompliments));
      setMilestones(loadFromStorage(STORAGE_KEYS.MILESTONES, initialMilestones));
      setPhotos(loadFromStorage(STORAGE_KEYS.PHOTOS, initialPhotos));
      setTodos(loadFromStorage(STORAGE_KEYS.TODOS, initialTodos));
      setMoods(loadFromStorage(STORAGE_KEYS.MOODS, initialMoods));
      setLoveDrops(loadFromStorage(STORAGE_KEYS.LOVE_DROPS, initialLoveDrops));
      setRecommendations(loadFromStorage(STORAGE_KEYS.RECOMMENDATIONS, initialRecommendations));
      setTruthOrDare(loadFromStorage(STORAGE_KEYS.TRUTH_OR_DARE, initialTruthOrDare));
      setPlaylist(loadFromStorage(STORAGE_KEYS.PLAYLIST, initialPlaylist));
      setChatMessages(deduplicateMessages(loadFromStorage(STORAGE_KEYS.CHAT, initialChatMessages)));
    }
    return ok;
  };

  // Calculated days together
  const daysTogether = getRelationshipDays(profile.anniversaryDate);

  // If locked, render the passcode lock screen
  if (isLocked) {
    return (
      <PasscodeLock
        profile={profile}
        onUnlock={(partnerId) => {
          setProfile((prev) => ({ ...prev, currentViewer: partnerId }));
          setIsLocked(false);
          triggerToast(`Welcome to your sanctuary, ${profile[partnerId].nickname}! 💕`);
        }}
        darkMode={profile.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0E11] text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors relative overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
      {/* Apple-style Dynamic Ambient Glowing Orbs Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-rose-400/20 dark:bg-rose-600/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-pink-400/15 dark:bg-pink-700/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[36rem] h-[36rem] rounded-full bg-amber-200/20 dark:bg-purple-950/20 blur-3xl" />

        {/* Floating Romantic Little Hearts scattered */}
        <div className="absolute top-24 left-10 text-rose-300/35 dark:text-rose-500/20 animate-floating-heart">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute top-1/2 right-12 text-pink-300/30 dark:text-pink-500/15 animate-floating-heart-delay-1">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div className="absolute bottom-24 left-1/4 text-rose-300/25 dark:text-rose-500/10 animate-floating-heart-delay-2">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div className="absolute top-3/4 right-1/4 text-rose-400/30 dark:text-rose-400/15 animate-floating-heart">
          <Heart className="w-7 h-7 fill-current" />
        </div>
      </div>

      {/* Top Header & Navigation Drawer */}
      <NavigationDrawer
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        onSwitchViewer={(viewer) => {
          soundEngine.playBubblePop();
          setProfile((prev) => ({ ...prev, currentViewer: viewer }));
          triggerToast(
            `Switched to viewing as ${profile[viewer].nickname} 💕`
          );
        }}
        onLockApp={() => setIsLocked(true)}
        ambientSound={ambientSound}
        onToggleAmbient={handleToggleAmbient}
        daysTogether={daysTogether}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenWidgetStudio={() => setIsWidgetStudioOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 relative z-10">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            daysTogether={daysTogether}
            onNavigate={setCurrentTab}
            moods={moods}
            onSendPoke={handleSendPoke}
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onTogglePhotoFavorite={handleTogglePhotoFavorite}
            milestones={milestones}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarView
            profile={profile}
            milestones={milestones}
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onOpenWidgetStudio={() => setIsWidgetStudioOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <ChatView
            messages={chatMessages}
            profile={profile}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
          />
        )}

        {currentTab === 'memories' && (
          <MemoriesView
            milestones={milestones}
            photos={photos}
            profile={profile}
            onAddPhoto={handleAddPhoto}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onTogglePhotoFavorite={handleTogglePhotoFavorite}
          />
        )}

        {currentTab === 'todos' && (
          <ToDoView
            todos={todos}
            profile={profile}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        )}

        {currentTab === 'mood' && (
          <MoodNotesView
            moods={moods}
            loveDrops={loveDrops}
            profile={profile}
            onUpdateMood={handleUpdateMood}
            onSendPoke={handleSendPoke}
            onAddLoveDrop={handleAddLoveDrop}
            onRevealDrop={handleRevealDrop}
            onReactDrop={handleReactDrop}
          />
        )}

        {currentTab === 'compliments' && (
          <ComplimentVaultView
            compliments={compliments}
            profile={profile}
            onAddCompliment={handleAddCompliment}
            onToggleFavorite={handleToggleFavoriteCompliment}
            onDeleteCompliment={handleDeleteCompliment}
          />
        )}

        {currentTab === 'media' && (
          <MediaCornerView
            recommendations={recommendations}
            profile={profile}
            playlist={playlist}
            onAddRecommendation={handleAddRecommendation}
            onUpdateStatus={handleUpdateRecommendationStatus}
            onUpdatePlaylist={handleUpdatePlaylist}
          />
        )}

        {currentTab === 'games' && (
          <TruthOrDareView
            cards={truthOrDare}
            profile={profile}
            onAddCustomCard={handleAddCustomCard}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
              syncService.sendStateUpdate('profile', updated);
            }}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Mobile Widgets & PWA Shortcuts Studio */}
      <MobileWidgetsStudio
        isOpen={isWidgetStudioOpen}
        onClose={() => setIsWidgetStudioOpen(false)}
        profile={profile}
        daysTogether={daysTogether}
        photos={photos}
        milestones={milestones}
        todos={todos}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setIsWidgetStudioOpen(false);
        }}
        onSendPoke={handleSendPoke}
      />

      {/* Interactive Toast Notification with Apple Glass look */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl glass-card text-stone-900 dark:text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 border border-white/50 dark:border-white/10">
            <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
