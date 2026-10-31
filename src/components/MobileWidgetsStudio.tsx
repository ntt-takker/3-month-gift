import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  X,
  Heart,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Clock,
  Download,
  Share2,
  ExternalLink,
  Flame,
  Send,
  Check,
} from 'lucide-react';
import { ActiveTab, CoupleProfile, PhotoMemory, Milestone, ToDoItem } from '../types';
import { soundEngine } from '../utils/audio';
import { triggerHaptic } from '../utils/androidDevice';

interface MobileWidgetsStudioProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  daysTogether: number;
  photos: PhotoMemory[];
  milestones: Milestone[];
  todos: ToDoItem[];
  onNavigateTab: (tab: ActiveTab) => void;
  onSendPoke: (type: 'hug' | 'kiss' | 'love') => void;
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
  const [selectedWidget, setSelectedWidget] = useState<'counter' | 'poke' | 'polaroid' | 'milestone'>('counter');
  const [testSent, setTestSent] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeViewer = profile[profile.currentViewer];
  const partner = profile.currentViewer === 'partner1' ? profile.partner2 : profile.partner1;
  const favoritePhoto = photos.find((p) => p.isFavorite) || photos[0];

  const handleTestPoke = (type: 'hug' | 'kiss' | 'love') => {
    onSendPoke(type);
    triggerHaptic(type === 'kiss' ? 'kiss' : type === 'hug' ? 'hug' : 'heartbeat');
    setTestSent(type);
    setTimeout(() => setTestSent(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Mobile Widgets Studio
            </h3>
            <p className="text-xs text-stone-500">
              Preview and pin home screen widgets & lock screen shortcuts for {profile.partner1.name} & {profile.partner2.name}
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 border-b border-stone-200/50 dark:border-stone-800">
          {[
            { id: 'counter', label: 'Love Counter Widget', icon: Clock },
            { id: 'poke', label: 'Quick Poke Widget', icon: Heart },
            { id: 'polaroid', label: 'Polaroid Memory Widget', icon: ImageIcon },
            { id: 'milestone', label: 'Anniversary Widget', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = selectedWidget === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setSelectedWidget(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                  isSel
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                    : 'glass-card-subtle text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Widget Preview Box simulating phone widget surface */}
        <div className="my-6 p-6 rounded-3xl bg-stone-900 text-white flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
          <div className="absolute top-3 left-4 text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            Home Screen Widget 2×2 Preview
          </div>

          {selectedWidget === 'counter' && (
            <div className="w-64 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-center my-4 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-medium mb-1">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>Together Forever</span>
              </div>
              <div className="text-4xl font-serif font-bold text-white tracking-tight my-1">
                {daysTogether}
              </div>
              <div className="text-xs text-stone-300 font-medium uppercase tracking-wider">
                Days In Love
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-stone-400 flex items-center justify-between">
                <span>{profile.partner1.name} ❤️ {profile.partner2.name}</span>
                <span>Since {profile.anniversaryDate}</span>
              </div>
            </div>
          )}

          {selectedWidget === 'poke' && (
            <div className="w-64 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-center my-4 shadow-xl">
              <div className="flex items-center justify-between text-xs text-stone-300 mb-3">
                <span className="font-semibold">{partner.nickname}</span>
                <span className="text-emerald-400 text-[10px]">● Online</span>
              </div>
              <div className="text-xs text-stone-400 mb-3">
                Send 1-Tap Love to {partner.name}:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTestPoke('kiss')}
                  className="p-2.5 rounded-2xl bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/30 text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-lg">💋</span>
                  <span className="text-[10px] font-semibold text-rose-200">Kiss</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestPoke('hug')}
                  className="p-2.5 rounded-2xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/30 text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-lg">🫂</span>
                  <span className="text-[10px] font-semibold text-amber-200">Hug</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestPoke('love')}
                  className="p-2.5 rounded-2xl bg-pink-500/30 hover:bg-pink-500/50 border border-pink-400/30 text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-lg">💖</span>
                  <span className="text-[10px] font-semibold text-pink-200">Love</span>
                </button>
              </div>

              {testSent && (
                <p className="text-[11px] text-rose-300 font-semibold mt-2.5 animate-bounce">
                  ✨ Instant vibration & sound sent to {partner.name}!
                </p>
              )}
            </div>
          )}

          {selectedWidget === 'polaroid' && (
            <div className="w-56 p-3 bg-white text-stone-900 rounded-2xl shadow-2xl my-3 text-center rotate-[-1deg]">
              <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100">
                <img
                  src={favoritePhoto?.url || '/pwa-512x512.png'}
                  alt="Polaroid Memory"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-serif text-xs italic text-stone-800 mt-2 px-1 truncate">
                {favoritePhoto?.caption || 'Our Forever Memory'}
              </p>
              <p className="text-[9px] text-stone-400 font-mono mt-0.5">
                {favoritePhoto?.date || profile.anniversaryDate}
              </p>
            </div>
          )}

          {selectedWidget === 'milestone' && (
            <div className="w-64 p-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-center my-4 shadow-xl">
              <span className="text-2xl">🥂</span>
              <div className="text-xs text-rose-300 font-semibold mt-1">
                Next Love Milestone
              </div>
              <div className="text-base font-serif font-bold text-white mt-0.5">
                {milestones[milestones.length - 1]?.title || 'Our 3rd Month Anniversary'}
              </div>
              <p className="text-[11px] text-stone-300 mt-1">
                {milestones[milestones.length - 1]?.date || profile.anniversaryDate}
              </p>
            </div>
          )}
        </div>

        {/* Installation Instructions */}
        <div className="p-4 rounded-2xl glass-card space-y-2 text-xs">
          <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            How to Add MS Verse App & Widgets to Your Phone:
          </p>
          <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-[11px]">
            <li>
              <strong>On Android (Chrome / Brave / Edge):</strong> Tap the <strong>Install App</strong> button or browser menu (⋮) → <strong>Install app / Add to Home screen</strong>. You will get the full standalone WebAPK experience with direct app shortcuts!
            </li>
            <li>
              <strong>On iPhone (Safari):</strong> Tap the <strong>Share</strong> button (box with arrow) → <strong>Add to Home Screen</strong>.
            </li>
            <li>
              <strong>Instant Partner Linking:</strong> Scan the QR code in the Android Pairing modal on your partner’s phone to connect your devices 24/7.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
