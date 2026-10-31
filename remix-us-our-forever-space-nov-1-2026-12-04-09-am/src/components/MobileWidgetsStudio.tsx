import { useState, useEffect } from 'react';
import {
  Smartphone,
  Clock,
  Calendar,
  Camera,
  Heart,
  Sparkles,
  X,
  Check,
  Share2,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Send,
  MessageCircle,
  HelpCircle,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleProfile, PhotoMemory, Milestone, ToDoItem, PartnerId } from '../types';
import { soundEngine } from '../utils/audio';

interface MobileWidgetsStudioProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  daysTogether: number;
  photos: PhotoMemory[];
  milestones: Milestone[];
  todos: ToDoItem[];
  onNavigateTab: (tab: any) => void;
  onSendPoke: (type: 'kiss' | 'hug' | 'love', message?: string) => void;
}

export default function MobileWidgetsStudio({
  isOpen,
  onClose,
  profile,
  daysTogether,
  photos,
  milestones,
  todos,
  onNavigateTab,
  onSendPoke,
}: MobileWidgetsStudioProps) {
  const [selectedWidget, setSelectedWidget] = useState<'clock' | 'calendar' | 'polaroid' | 'whisper'>('clock');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isStandbyActive, setIsStandbyActive] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live ticking clock for widget previews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const activePartner = profile[profile.currentViewer];
  const otherPartner = profile[profile.currentViewer === 'partner1' ? 'partner2' : 'partner1'];

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const secondsString = String(currentTime.getSeconds()).padStart(2, '0');
  const dateString = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Upcoming event for calendar widget
  const upcomingTodo = todos.find((t) => !t.completed);
  const featuredPhoto = photos.length > 0 ? photos[selectedPhotoIdx % photos.length] : null;

  const handleCopyShortcut = (tabPath: string) => {
    soundEngine.playSuccess();
    const url = `${window.location.origin}${tabPath}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Fullscreen Nightstand / Bedside Mode if triggered */}
      {isStandbyActive ? (
        <div className="fixed inset-0 z-60 bg-black text-white flex flex-col items-center justify-center p-6 select-none animate-fade-in">
          <button
            type="button"
            onClick={() => setIsStandbyActive(false)}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-300 transition-all cursor-pointer flex items-center gap-2 text-xs"
          >
            <Minimize2 className="w-4 h-4" /> Exit Nightstand Clock
          </button>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-rose-500 animate-pulse text-sm font-semibold tracking-widest uppercase">
              <Heart className="w-4 h-4 fill-current" /> MS Verse Nightstand Clock
            </div>

            {/* Glowing Big Digital Clock */}
            <div className="font-mono text-7xl sm:text-9xl font-extrabold tracking-tight text-white drop-shadow-[0_0_35px_rgba(244,63,94,0.35)] flex items-baseline justify-center gap-2">
              <span>{timeString}</span>
              <span className="text-3xl sm:text-4xl text-rose-400 font-sans">{secondsString}</span>
            </div>

            <p className="text-xl sm:text-2xl font-serif text-stone-300">
              {dateString}
            </p>

            <div className="pt-6 flex items-center justify-center gap-3">
              <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2.5 text-stone-200">
                <Heart className="w-5 h-5 text-rose-400 fill-current" />
                <span className="text-base font-semibold">Day {daysTogether} Together</span>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-stone-300 text-sm">
                {profile.partner1.nickname} & {profile.partner2.nickname}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Studio Modal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] glass-panel rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Studio Header */}
        <div className="p-4 sm:p-6 border-b border-white/20 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Mobile Home Screen Widgets
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Live widgets for your phone: Clock, Calendar, Couple Polaroids & 1-tap Whispers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              onClose();
            }}
            className="p-2.5 rounded-2xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Widget Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setSelectedWidget('clock');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedWidget === 'clock'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'glass-card text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Couple Clock Widget</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setSelectedWidget('calendar');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedWidget === 'calendar'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'glass-card text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar & Agenda Widget</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setSelectedWidget('polaroid');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedWidget === 'polaroid'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'glass-card text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo Frame Widget</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setSelectedWidget('whisper');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedWidget === 'whisper'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                  : 'glass-card text-stone-700 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-800'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 fill-current" />
              <span>Quick Whispers Widget</span>
            </button>
          </div>

          {/* Widget Live Display Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Mobile Phone Screen Simulation Frame */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[340px] rounded-[2.5rem] p-3.5 bg-stone-900 border-[6px] border-stone-800 shadow-2xl relative">
                {/* Dynamic Island / Speaker notch */}
                <div className="w-24 h-4 bg-stone-950 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                </div>

                {/* Mobile Wallpaper Canvas */}
                <div className="w-full rounded-[2rem] bg-gradient-to-br from-rose-950 via-stone-900 to-stone-950 p-4 text-white relative overflow-hidden min-h-[380px] flex flex-col justify-between">
                  {/* Subtle wallpaper glowing heart */}
                  <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

                  {/* Widget Preview Box depending on selection */}
                  {selectedWidget === 'clock' && (
                    <div className="glass-card rounded-2xl p-4 border border-white/20 text-center shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] text-stone-300 font-medium mb-1">
                        <span className="flex items-center gap-1 text-rose-300">
                          <Heart className="w-3 h-3 fill-rose-400 text-rose-400 animate-pulse" /> MS Verse
                        </span>
                        <span>{dateString}</span>
                      </div>
                      <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white my-1 flex items-baseline justify-center gap-1.5">
                        <span>{timeString}</span>
                        <span className="text-base text-rose-400 font-sans">{secondsString}s</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-300">Day {daysTogether} Together</span>
                        <span className="text-stone-300 text-[11px]">
                          {profile.partner1.nickname} & {profile.partner2.nickname}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedWidget === 'calendar' && (
                    <div className="glass-card rounded-2xl p-4 border border-white/20 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Couple Calendar
                        </span>
                        <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full text-rose-200">
                          {currentTime.toLocaleDateString([], { month: 'short' })}
                        </span>
                      </div>
                      <div className="text-center py-1">
                        <p className="text-3xl font-extrabold text-white">{currentTime.getDate()}</p>
                        <p className="text-[11px] text-stone-300">{currentTime.toLocaleDateString([], { weekday: 'long' })}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/10 text-[11px] space-y-1">
                        <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Next Shared Moment:</div>
                        <div className="font-semibold text-white truncate flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                          {upcomingTodo ? upcomingTodo.title : 'Every moment with you 💕'}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWidget === 'polaroid' && (
                    <div className="bg-white text-stone-900 rounded-2xl p-2.5 shadow-xl rotate-[-1deg] transition-transform hover:rotate-0">
                      <div className="w-full h-36 rounded-xl bg-stone-100 overflow-hidden relative">
                        {featuredPhoto ? (
                          <img
                            src={featuredPhoto.url}
                            alt={featuredPhoto.caption}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            No photo chosen yet
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-mono">
                          Day {daysTogether}
                        </span>
                      </div>
                      <div className="pt-2 pb-1 px-1 text-center font-serif text-xs font-semibold text-stone-800 truncate">
                        {featuredPhoto ? featuredPhoto.caption : 'Forever & Always'}
                      </div>
                    </div>
                  )}

                  {selectedWidget === 'whisper' && (
                    <div className="glass-card rounded-2xl p-3.5 border border-white/20 shadow-lg space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-300">Quick Love Gestures</span>
                        <span className="text-[10px] text-stone-400">1-Tap Sync</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playKissSound();
                            onSendPoke('kiss', 'A sweet 1-tap widget kiss 💋');
                            confetti({ particleCount: 20, spread: 40 });
                          }}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 text-center transition-colors cursor-pointer text-xs"
                        >
                          <div className="text-xl mb-0.5">💋</div>
                          <div className="text-[10px] text-stone-200">Kiss</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playHugSound();
                            onSendPoke('hug', 'A warm tight widget hug 🫂');
                            confetti({ particleCount: 20, spread: 40 });
                          }}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 text-center transition-colors cursor-pointer text-xs"
                        >
                          <div className="text-xl mb-0.5">🫂</div>
                          <div className="text-[10px] text-stone-200">Hug</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playSuccess();
                            onNavigateTab('chat');
                            onClose();
                          }}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 text-center transition-colors cursor-pointer text-xs"
                        >
                          <div className="text-xl mb-0.5">💌</div>
                          <div className="text-[10px] text-stone-200">Chat</div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* App Dock Simulation */}
                  <div className="mt-4 p-2 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-around">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/80 flex items-center justify-center text-white text-xs shadow-sm">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-pink-500/80 flex items-center justify-center text-white text-xs shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/80 flex items-center justify-center text-white text-xs shadow-sm">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/80 flex items-center justify-center text-white text-xs shadow-sm">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className="w-28 h-1 bg-stone-700 rounded-full mx-auto mt-3" />
              </div>
            </div>

            {/* Right: Controls & Android / Phone Setup Guide */}
            <div className="lg:col-span-5 space-y-4">
              {/* Standby Fullscreen Bedside Mode Button */}
              {selectedWidget === 'clock' && (
                <div className="p-4 rounded-2xl glass-card space-y-2 border border-white/30 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-500" /> StandBy Bedside Mode
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      Nightstand Clock
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Turn your phone into a live romantic bedside clock when docking or going to sleep together.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBubblePop();
                      setIsStandbyActive(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-rose-500/20 cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" /> Launch Bedside Clock Fullscreen
                  </button>
                </div>
              )}

              {/* Photo widget controls */}
              {selectedWidget === 'polaroid' && photos.length > 1 && (
                <div className="p-4 rounded-2xl glass-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Select Memory to Display
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Photo {selectedPhotoIdx + 1} of {photos.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                    {photos.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          selectedPhotoIdx === idx ? 'border-rose-500 scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Android & Mobile Quick Widget Setup Guide */}
              <div className="p-4 rounded-2xl glass-card space-y-3 border border-white/30 dark:border-white/10">
                <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>How to Pin to Android Home Screen</span>
                </div>

                <ol className="text-xs text-stone-600 dark:text-stone-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-stone-800 dark:text-white">Install App</strong>: In Chrome or Samsung Internet, tap <span className="font-semibold text-rose-500">⋮ Menu → "Add to Home screen"</span> or <span className="font-semibold text-rose-500">"Install app"</span>.
                  </li>
                  <li>
                    <strong className="text-stone-800 dark:text-white">Home Screen Shortcut Widgets</strong>: Once on your home screen, <em>long-press the MS Verse app icon</em>.
                  </li>
                  <li>
                    A popup menu will appear with fast shortcuts: <strong>📅 Couple Calendar</strong>, <strong>⏰ Love Clock</strong>, and <strong>💬 Chat & Whispers</strong>.
                  </li>
                  <li>
                    <em>Drag any shortcut</em> directly onto your phone home screen to create dedicated 1-tap widgets!
                  </li>
                </ol>
              </div>

              {/* Quick direct URL shortcuts copy */}
              <div className="p-4 rounded-2xl glass-card space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-200">
                  <span>Direct Widget Bookmark Links</span>
                  {copiedLink && (
                    <span className="text-emerald-500 text-[11px] flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Copied Link!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyShortcut('/?tab=calendar')}
                    className="p-2.5 rounded-xl glass-card-subtle hover:bg-white/80 dark:hover:bg-stone-800 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate">📅 Calendar Widget</span>
                    <Share2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShortcut('/?tab=dashboard')}
                    className="p-2.5 rounded-xl glass-card-subtle hover:bg-white/80 dark:hover:bg-stone-800 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate">⏰ Clock & Moments</span>
                    <Share2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShortcut('/?tab=chat')}
                    className="p-2.5 rounded-xl glass-card-subtle hover:bg-white/80 dark:hover:bg-stone-800 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate">💬 Chat & Whispers</span>
                    <Share2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShortcut('/?tab=memories')}
                    className="p-2.5 rounded-xl glass-card-subtle hover:bg-white/80 dark:hover:bg-stone-800 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <span className="font-medium text-stone-800 dark:text-stone-200 truncate">📸 Polaroids</span>
                    <Share2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/20 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-stone-900/40">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Synced 24/7 between <strong className="text-stone-700 dark:text-stone-300">{profile.partner1.nickname}</strong> & <strong className="text-stone-700 dark:text-stone-300">{profile.partner2.nickname}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-500 text-white font-medium text-xs hover:bg-rose-600 transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
