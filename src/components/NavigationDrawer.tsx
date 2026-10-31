import { useState } from 'react';
import {
  Menu,
  X,
  Heart,
  Home,
  Camera,
  CheckSquare,
  Smile,
  Award,
  Film,
  Sparkles,
  Settings,
  Lock,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  MessageCircle,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  CalendarHeart,
  Smartphone,
} from 'lucide-react';
import { ActiveTab, CoupleProfile, PartnerId } from '../types';
import { soundEngine } from '../utils/audio';

interface NavigationDrawerProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: CoupleProfile;
  onSwitchViewer: (viewer: PartnerId) => void;
  onLockApp: () => void;
  ambientSound: boolean;
  onToggleAmbient: () => void;
  daysTogether: number;
  onToggleDarkMode: () => void;
  unreadChatCount?: number;
  onOpenWidgetStudio?: () => void;
  onOpenAndroidSync?: () => void;
}

export default function NavigationDrawer({
  currentTab,
  onSelectTab,
  profile,
  onSwitchViewer,
  onLockApp,
  ambientSound,
  onToggleAmbient,
  daysTogether,
  onToggleDarkMode,
  unreadChatCount = 0,
  onOpenWidgetStudio,
  onOpenAndroidSync,
}: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switchTarget, setSwitchTarget] = useState<PartnerId | null>(null);
  const [switchPin, setSwitchPin] = useState('');
  const [switchError, setSwitchError] = useState(false);

  const activeViewer = profile[profile.currentViewer];
  const otherViewerId: PartnerId = profile.currentViewer === 'partner1' ? 'partner2' : 'partner1';
  const otherViewer = profile[otherViewerId];

  const navItems: { id: ActiveTab; label: string; icon: typeof Home; subtitle: string; heartColor?: string; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, subtitle: 'Live Moments & Letters', heartColor: 'text-rose-500' },
    { id: 'calendar', label: 'Couple Calendar', icon: CalendarHeart, subtitle: 'Milestones, Dates & Birthdays', heartColor: 'text-rose-500' },
    { id: 'chat', label: 'Chat & Whispers', icon: MessageCircle, subtitle: '24/7 Live Sync & Whispers', heartColor: 'text-pink-500', badge: unreadChatCount > 0 ? `${unreadChatCount}` : 'Live' },
    { id: 'memories', label: 'Memories & Photos', icon: Camera, subtitle: 'Timeline & Shared Polaroids', heartColor: 'text-amber-500' },
    { id: 'todos', label: 'To-Do & Dates', icon: CheckSquare, subtitle: 'Shared Date Wishlist', heartColor: 'text-emerald-500' },
    { id: 'mood', label: 'Mood & Notes', icon: Smile, subtitle: 'Daily Mood & Love Drops', heartColor: 'text-pink-500' },
    { id: 'compliments', label: 'Compliment Vaults', icon: Award, subtitle: `${profile.partner2.nickname} & ${profile.partner1.nickname}`, heartColor: 'text-rose-600' },
    { id: 'media', label: 'Media Corner', icon: Film, subtitle: 'Spotify Playlist & Songs', heartColor: 'text-purple-500' },
    { id: 'games', label: 'Truth or Dare', icon: Sparkles, subtitle: 'Apart, Public & Dark Romance', heartColor: 'text-red-500' },
    { id: 'settings', label: 'Settings & Security', icon: Settings, subtitle: 'Nicknames, PINs & Backups', heartColor: 'text-stone-400' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    soundEngine.playBubblePop();
    onSelectTab(tab);
    setIsOpen(false);
  };

  const initiateSwitch = (target: PartnerId) => {
    if (target === profile.currentViewer) return;
    soundEngine.playBubblePop();
    setSwitchTarget(target);
    setSwitchPin('');
    setSwitchError(false);
  };

  const handleSwitchDigit = (digit: string) => {
    if (!switchTarget || switchPin.length >= 4) return;
    const nextPin = switchPin + digit;
    setSwitchPin(nextPin);
    soundEngine.playHeartSound();

    if (nextPin.length === 4) {
      const expectedPin =
        switchTarget === 'partner1'
          ? profile.partner1Passcode || '1214'
          : profile.partner2Passcode || '0418';

      if (nextPin === expectedPin) {
        soundEngine.playUnlockSound();
        onSwitchViewer(switchTarget);
        setSwitchTarget(null);
        setSwitchPin('');
      } else {
        setSwitchError(true);
        soundEngine.playBubblePop();
        setTimeout(() => {
          setSwitchPin('');
          setSwitchError(false);
        }, 500);
      }
    }
  };

  return (
    <>
      {/* Apple-style Frosted Glass Top Bar */}
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-stone-200/70 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand & Menu Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsOpen(true);
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              aria-label="Open menu drawer"
              title="All Features & Sanctuaries"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onSelectTab('dashboard');
              }}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <span className="font-serif text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                MS Verse <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
              </span>
              <span className="hidden sm:inline text-xs text-stone-400 dark:text-stone-600">·</span>
              <span className="hidden sm:inline text-xs text-stone-600 dark:text-stone-300 font-medium">
                Day {daysTogether}
              </span>
            </button>
          </div>

          {/* Zone 2: Primary Desktop Navigation Links (Clean, Uncluttered Typography) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'chat', label: 'Whispers & Chat', badge: unreadChatCount > 0 ? unreadChatCount : undefined },
              { id: 'memories', label: 'Memories' },
              { id: 'todos', label: 'Bucket List' },
            ].map((tab) => {
              const isSelected = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playBubblePop();
                    onSelectTab(tab.id as ActiveTab);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/70 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Essential Actions Only */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Active Partner Avatar & Switch Button */}
            <button
              type="button"
              onClick={() => initiateSwitch(otherViewerId)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-card-subtle hover:bg-white/90 dark:hover:bg-stone-800 transition-all cursor-pointer text-xs group"
              title={`Viewing as ${activeViewer.nickname}. Click to switch to ${otherViewer.nickname}'s side.`}
            >
              <span className="text-base select-none">{activeViewer.avatar}</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 max-w-[80px] sm:max-w-[110px] truncate">
                {activeViewer.name}
              </span>
              <KeyRound className="w-3 h-3 text-stone-400 group-hover:text-rose-500 transition-colors ml-0.5" />
            </button>

            {/* Ambient Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                onToggleAmbient();
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                ambientSound
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-400/50'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/80 dark:hover:bg-stone-800'
              }`}
              title={ambientSound ? 'Mute ambient music' : 'Play romantic ambient music'}
              aria-label="Toggle ambient sound"
            >
              {ambientSound ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                onToggleDarkMode();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-amber-300 transition-all active:scale-95 cursor-pointer shadow-xs"
              title={profile.darkMode ? 'Switch to Linen Light Mode' : 'Switch to Midnight Dark Mode'}
              aria-label="Toggle color theme"
            >
              {profile.darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 hover:text-stone-900" />
              )}
            </button>

            {/* Lock App Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onLockApp();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl glass-card hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-rose-600 flex items-center justify-center text-stone-500 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Lock sanctuary"
              aria-label="Lock app"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Frosted Glass Slide-over Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] glass-panel border-r border-stone-200/80 dark:border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-5">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-5 border-b border-stone-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="MS Verse"
                className="w-10 h-10 rounded-2xl shadow-sm object-cover border border-rose-300/40"
              />
              <div>
                <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  MS Verse
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h2>
                <p className="text-xs text-rose-500 font-medium">
                  {profile.partner1.nickname} & {profile.partner2.nickname}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsOpen(false);
              }}
              className="p-2 rounded-xl glass-card-subtle text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Partner Info Card */}
          <div className="my-4 p-3.5 rounded-2xl glass-card">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-stone-500 dark:text-stone-400">Your Private Side</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Unlocked
              </span>
            </div>
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl">{activeViewer.avatar}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">
                    {activeViewer.nickname}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Given with love by {otherViewer.nickname}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  initiateSwitch(otherViewerId);
                }}
                className="shrink-0 p-2 rounded-xl glass-card-subtle text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1 hover:scale-105 transition-all cursor-pointer font-medium"
                title={`Switch to ${otherViewer.nickname}`}
              >
                <span>Switch</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all cursor-pointer text-left group ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                      : 'hover:bg-white/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'glass-card-subtle text-stone-600 dark:text-stone-300 group-hover:text-rose-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{item.label}</p>
                      <p
                        className={`text-[11px] leading-tight mt-0.5 ${
                          isSelected ? 'text-white/80' : 'text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {item.badge ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white text-rose-600'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <Heart
                      className={`w-3.5 h-3.5 transition-opacity ${
                        isSelected ? 'text-white fill-white' : 'opacity-0 group-hover:opacity-40'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer with Lock and Mobile Widgets */}
        <div className="p-5 border-t border-stone-200/60 dark:border-white/10 space-y-2.5">
          {onOpenAndroidSync && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsOpen(false);
                onOpenAndroidSync();
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Android App & Partner Pair</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                24/7 Sync
              </span>
            </button>
          )}

          {onOpenWidgetStudio && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsOpen(false);
                onOpenWidgetStudio();
              }}
              className="w-full py-2.5 px-3 rounded-2xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                <span>Mobile Widgets Studio</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 font-bold">
                Phone
              </span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Forever Sanctuary
            </span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setIsOpen(false);
                onLockApp();
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Lock className="w-3.5 h-3.5" /> Lock App
            </button>
          </div>
        </div>
      </aside>

      {/* Protected Switch Side Passcode Modal */}
      {switchTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
          <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl border border-white/60 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setSwitchTarget(null);
                setSwitchPin('');
              }}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
              Access {profile[switchTarget].nickname}’s Space
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 mb-4">
              Enter {profile[switchTarget].nickname}’s private PIN to switch sides:
            </p>

            {/* PIN heart dots */}
            <div
              className={`flex items-center gap-3 mb-5 ${
                switchError ? 'animate-bounce text-rose-600' : ''
              }`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = switchPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                      isFilled ? 'text-rose-500 scale-125' : 'text-stone-300 dark:text-stone-700'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isFilled ? 'currentColor' : 'none'} />
                  </div>
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleSwitchDigit(n)}
                  className="h-11 rounded-xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-lg font-medium text-stone-800 dark:text-stone-100 active:scale-95 transition-all cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => handleSwitchDigit('0')}
                className="h-11 rounded-xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-lg font-medium text-stone-800 dark:text-stone-100 active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setSwitchPin((prev) => prev.slice(0, -1))}
                className="h-11 rounded-xl glass-card-subtle text-xs text-stone-500 hover:text-stone-800 flex items-center justify-center active:scale-95 cursor-pointer"
              >
                Del
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
