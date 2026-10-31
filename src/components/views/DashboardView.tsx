import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Calendar,
  Sparkles,
  Gift,
  Clock,
  Camera,
  CheckSquare,
  Smile,
  Mail,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Disc,
  Plus,
  MapPin,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { ActiveTab, CoupleProfile, DailyMood, PartnerId, PhotoMemory, Milestone } from '../../types';
import { soundEngine } from '../../utils/audio';
import { checkIsMilestoneToday } from '../../utils/storage';

interface DashboardViewProps {
  profile: CoupleProfile;
  daysTogether: number;
  onNavigate: (tab: ActiveTab) => void;
  moods: Record<PartnerId, DailyMood>;
  onSendPoke: (type: 'hug' | 'kiss' | 'love') => void;
  photos: PhotoMemory[];
  onAddPhoto: (photo: Omit<PhotoMemory, 'id' | 'addedAt'>) => void;
  onTogglePhotoFavorite: (id: string) => void;
  onDeletePhoto?: (id: string) => void;
  milestones?: Milestone[];
}

export default function DashboardView({
  profile,
  daysTogether,
  onNavigate,
  moods,
  onSendPoke,
  photos = [],
  onAddPhoto,
  onTogglePhotoFavorite,
  onDeletePhoto,
  milestones = [],
}: DashboardViewProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);

  // New photo modal form state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live timer ticks every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Anniversary date math
  const startDate = new Date(profile.anniversaryDate).getTime();
  const elapsedMs = Math.max(0, now - startDate);
  const totalDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor((elapsedMs / (1000 * 60 * 60)) % 24);
  const totalMinutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
  const totalSeconds = Math.floor((elapsedMs / 1000) % 60);

  // Birthday countdown math
  const calculateNextDate = (birthdayStr: string) => {
    if (!birthdayStr) return { days: 0, hours: 0, isToday: false };
    const [bYear, bMonth, bDay] = birthdayStr.split('-').map(Number);
    const currentDate = new Date(now);
    const curYear = currentDate.getFullYear();
    let nextBday = new Date(curYear, bMonth - 1, bDay, 0, 0, 0);

    if (nextBday.getTime() < now) {
      nextBday = new Date(curYear + 1, bMonth - 1, bDay, 0, 0, 0);
    }

    const diffMs = nextBday.getTime() - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    return { days, hours, isToday: days === 0 };
  };

  const p1Bday = calculateNextDate(profile.partner1.birthday);
  const p2Bday = calculateNextDate(profile.partner2.birthday);

  // Next milestone (100 days milestone)
  const daysUntil100 = Math.max(0, 100 - totalDays);

  // Check if today marks a special milestone
  const activeMilestone = checkIsMilestoneToday(profile.anniversaryDate, now, milestones);

  const activeUser = profile[profile.currentViewer];
  const partnerUser = profile[profile.currentViewer === 'partner1' ? 'partner2' : 'partner1'];

  const handleOpenAnniversaryLetter = () => {
    soundEngine.playUnlockSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af', '#f43f5e', '#fb7185', '#d4af37'],
    });
    setIsLetterOpen(true);
  };

  // Photo carousel navigation
  const handlePrevPhoto = () => {
    if (photos.length <= 1) return;
    soundEngine.playBubblePop();
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    if (photos.length <= 1) return;
    soundEngine.playBubblePop();
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  // Handle local photo file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new photo
  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newCaption.trim()) return;

    soundEngine.playSuccess();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af'],
    });

    onAddPhoto({
      url: newPhotoUrl.trim(),
      caption: newCaption.trim(),
      date: newDate || new Date().toISOString().slice(0, 10),
      location: newLocation.trim() || undefined,
      addedBy: profile.currentViewer,
      isFavorite: true,
    });

    setNewPhotoUrl('');
    setNewCaption('');
    setNewLocation('');
    setIsAddPhotoOpen(false);
    setPhotoIndex(0); // Focus newly added photo
  };

  const currentPhoto = photos[photoIndex] || photos[0];

  return (
    <div className="space-y-7 animate-fade-in pb-16 relative z-10">
      {/* 1. Dynamic Milestone Celebration Card: ONLY APPEARS ON SPECIAL MILESTONES */}
      {activeMilestone ? (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/90 via-rose-600/95 to-pink-700 text-white shadow-2xl shadow-rose-950/20 p-6 sm:p-8 backdrop-blur-xl border border-white/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-rose-950/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide uppercase mb-3 border border-white/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeMilestone.badge}</span>
                <Heart className="w-3 h-3 text-rose-200 fill-current ml-0.5" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight mb-2">
                {activeMilestone.title}
              </h1>
              <p className="text-sm sm:text-base text-rose-50 leading-relaxed font-light">
                {activeMilestone.subtitle}
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={handleOpenAnniversaryLetter}
                className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/95 text-rose-700 hover:bg-white active:scale-95 shadow-xl shadow-rose-950/20 backdrop-blur-md transition-all font-semibold text-sm cursor-pointer border border-white/40"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Mail className="w-4 h-4 fill-current" />
                </div>
                <span>Open Anniversary Love Letter</span>
                <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* Regular Romantic Sanctuary Banner when not on a milestone day */
        <section className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-7 shadow-sm border border-white/60 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Private Couple Sanctuary</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Welcome back, {activeUser.nickname}
                <span className="text-2xl">{activeUser.avatar}</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-1">
                Cherishing {daysTogether} beautiful days with your love, {partnerUser.nickname} 💕
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playBubblePop();
                  onNavigate('calendar');
                }}
                className="px-4 py-2.5 rounded-2xl glass-card hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-rose-300/30"
              >
                <Calendar className="w-4 h-4" />
                <span>Couple Calendar</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAnniversaryLetter}
                className="px-4 py-2.5 rounded-2xl glass-card hover:bg-rose-500/15 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-white/40 dark:border-white/10"
              >
                <Mail className="w-4 h-4 text-rose-500" />
                <span>Love Letter</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Live Relationship Counter & Birthday Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Time Together Live Counter */}
        <div className="md:col-span-2 rounded-3xl glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-3 right-4 text-rose-400/20 dark:text-rose-500/10 pointer-events-none">
            <Heart className="w-16 h-16 fill-current" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" /> Time Together
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" /> Since July 31, 2026
              </span>
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Loving You Every Second
            </h2>
          </div>

          {/* Digits Display */}
          <div className="grid grid-cols-4 gap-2.5 my-4 text-center">
            <div className="glass-card-subtle p-3 rounded-2xl border border-white/40 dark:border-white/5">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {totalDays}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">Days</div>
            </div>
            <div className="glass-card-subtle p-3 rounded-2xl border border-white/40 dark:border-white/5">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {String(totalHours).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">Hours</div>
            </div>
            <div className="glass-card-subtle p-3 rounded-2xl border border-white/40 dark:border-white/5">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-white">
                {String(totalMinutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mt-0.5">Mins</div>
            </div>
            <div className="bg-rose-500/10 dark:bg-rose-500/20 p-3 rounded-2xl border border-rose-300/40 dark:border-rose-500/30">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                {String(totalSeconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-rose-500 mt-0.5 flex items-center justify-center gap-0.5">
                <span>Secs</span> <Heart className="w-2.5 h-2.5 fill-current animate-pulse" />
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-200/40 dark:border-stone-800/60">
            <span>Next Milestone: 100 Days</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
              {daysUntil100} days to go
            </span>
          </p>
        </div>

        {/* Double Birthday Countdowns with Loving Nicknames */}
        <div className="rounded-3xl glass-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5 truncate">
              <Gift className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{profile.partner1.nickname}</span>
            </span>
            <span className="text-xl shrink-0">{profile.partner1.avatar}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
              <span>{p1Bday.days}</span>
              <span className="text-sm font-sans font-normal text-stone-500 dark:text-stone-400">days</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Dec 14 · {p1Bday.hours}h remaining
            </div>
          </div>
          <div className="text-[11px] text-stone-600 dark:text-stone-400 glass-card-subtle p-2.5 rounded-xl border border-white/40 dark:border-white/5 flex items-center justify-between">
            <span>Affection:</span>
            <span className="font-medium text-stone-900 dark:text-stone-200 truncate max-w-[120px]">
              {profile.partner1.nickname}
            </span>
          </div>
        </div>

        <div className="rounded-3xl glass-card p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5 truncate">
              <Gift className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{profile.partner2.nickname}</span>
            </span>
            <span className="text-xl shrink-0">{profile.partner2.avatar}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold font-mono tabular-nums text-stone-900 dark:text-stone-100 flex items-baseline gap-1.5">
              <span>{p2Bday.days}</span>
              <span className="text-sm font-sans font-normal text-stone-500 dark:text-stone-400">days</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Apr 18 · {p2Bday.hours}h remaining
            </div>
          </div>
          <div className="text-[11px] text-stone-600 dark:text-stone-400 glass-card-subtle p-2.5 rounded-xl border border-white/40 dark:border-white/5 flex items-center justify-between">
            <span>Affection:</span>
            <span className="font-medium text-rose-600 dark:text-rose-400 truncate max-w-[120px]">
              {profile.partner2.nickname}
            </span>
          </div>
        </div>
      </section>

      {/* 3. NEW HOME SCREEN COUPLE PHOTOS WIDGET */}
      <section className="rounded-3xl glass-panel p-5 sm:p-6 shadow-sm border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                Our Memories & Polaroids
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Shared couple moments · Changeable by both of you anytime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Our Photo</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('memories')}
              className="px-3 py-1.5 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-300 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl flex flex-col items-center justify-center">
            <Heart className="w-10 h-10 text-rose-400 mb-2 animate-bounce" />
            <p className="text-sm font-serif text-stone-700 dark:text-stone-200">
              No couple photos added yet.
            </p>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Upload your first memory together! Both of you can add and view them anytime.
            </p>
            <button
              type="button"
              onClick={() => setIsAddPhotoOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Couple Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left / Main Polaroid Card */}
            <div className="md:col-span-7 relative group">
              <div className="glass-card p-3.5 rounded-3xl overflow-hidden shadow-md border border-white/70 dark:border-white/10 transition-transform duration-300">
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top tags */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full glass-panel text-[11px] font-semibold text-stone-900 dark:text-white shadow-xs backdrop-blur-md">
                      {photoIndex + 1} / {photos.length}
                    </span>
                    {currentPhoto.location && (
                      <span className="px-2.5 py-1 rounded-full glass-panel text-[11px] font-medium text-stone-700 dark:text-stone-200 flex items-center gap-1 shadow-xs backdrop-blur-md">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        {currentPhoto.location}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTogglePhotoFavorite(currentPhoto.id)}
                      className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                      title="Favorite photo"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={currentPhoto.isFavorite ? 'currentColor' : 'none'}
                      />
                    </button>
                    {onDeletePhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this photo from both of your apps?')) {
                            onDeletePhoto(currentPhoto.id);
                          }
                        }}
                        className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-stone-500 hover:text-rose-600 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                        title="Delete photo from both apps"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Navigation arrows */}
                  {photos.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        className="w-9 h-9 rounded-full glass-panel text-stone-800 dark:text-white flex items-center justify-center pointer-events-auto hover:scale-110 transition-transform cursor-pointer shadow-md"
                        title="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        className="w-9 h-9 rounded-full glass-panel text-stone-800 dark:text-white flex items-center justify-center pointer-events-auto hover:scale-110 transition-transform cursor-pointer shadow-md"
                        title="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Caption below photo */}
                <div className="p-3">
                  <p className="text-sm font-serif italic text-stone-800 dark:text-stone-200 leading-snug">
                    &ldquo;{currentPhoto.caption}&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-2">
                    <span>{new Date(currentPhoto.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    <span>Added with love by {profile[currentPhoto.addedBy]?.nickname || 'Us'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Thumbnails & Quick Actions */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3">
              <div className="glass-card p-4 rounded-2xl">
                <h4 className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Moments Strip
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 8).map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playBubblePop();
                        setPhotoIndex(idx);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all cursor-pointer ${
                        photoIndex === idx
                          ? 'ring-2 ring-rose-500 scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100 hover:scale-102'
                      }`}
                    >
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card-subtle p-4 rounded-2xl text-xs space-y-2">
                <p className="font-semibold text-stone-800 dark:text-stone-200">
                  Couple Photo Sanctuary
                </p>
                <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
                  Every photo is safely synchronized 24/7. Both {profile.partner1.nickname} and {profile.partner2.nickname} can upload memories anytime.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(true)}
                  className="w-full mt-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Another Memory
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Shared Daily Mood & Romantic Poke Bar */}
      <section className="rounded-3xl glass-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Smile className="w-4 h-4 text-amber-500" /> How We Are Feeling Today
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Live status shared between you two
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('mood')}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            Update my mood <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Partner 1 Status */}
          <div className="p-4 rounded-2xl glass-card-subtle border border-white/60 dark:border-white/10 flex items-start gap-3.5">
            <div className="text-3xl p-2.5 rounded-2xl bg-white/90 dark:bg-stone-800/90 shadow-xs border border-white/60 dark:border-white/10">
              {moods.partner1?.emoji || '🥰'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  {profile.partner1.nickname}
                </span>
                <span className="text-[10px] text-stone-500">Live</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 italic">
                &ldquo;{moods.partner1?.statusText || 'Happy today'}&rdquo;
              </p>
            </div>
          </div>

          {/* Partner 2 Status */}
          <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-300/40 dark:border-rose-500/25 flex items-start gap-3.5">
            <div className="text-3xl p-2.5 rounded-2xl bg-white/90 dark:bg-stone-800/90 shadow-xs border border-white/60 dark:border-white/10">
              {moods.partner2?.emoji || '💖'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  {profile.partner2.nickname}
                  <Heart className="w-3 h-3 text-rose-500 fill-current" />
                </span>
                <span className="text-[10px] text-stone-500">Live</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 italic">
                &ldquo;{moods.partner2?.statusText || 'Counting down to our date'}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Quick Send Gesture Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200/50 dark:border-stone-800/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Send a sweet gesture to {partnerUser.nickname}:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSendPoke('hug')}
              className="px-3.5 py-1.5 rounded-xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>🫂</span> Send Hug
            </button>
            <button
              type="button"
              onClick={() => onSendPoke('kiss')}
              className="px-3.5 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-xs font-medium text-pink-700 dark:text-pink-300 border border-pink-300/40 dark:border-pink-500/30 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>💋</span> Send Kiss
            </button>
            <button
              type="button"
              onClick={() => onSendPoke('love')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-medium flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs shadow-rose-500/25"
            >
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse" /> Send Love
            </button>
          </div>
        </div>
      </section>

      {/* 5. Quick Launchpad to Sanctuary Features */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('chat');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-pink-400 dark:hover:border-pink-500 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Chat <Heart className="w-2.5 h-2.5 text-pink-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">24/7 Whispers</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('media');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Disc className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Spotify <Heart className="w-2.5 h-2.5 text-emerald-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">Shared Playlist</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('memories');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Scrapbook <Heart className="w-2.5 h-2.5 text-amber-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">Photos & Timeline</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('todos');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Wishlist <Heart className="w-2.5 h-2.5 text-blue-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">Dream Dates</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('compliments');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-rose-400 dark:hover:border-rose-500 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Vaults <Heart className="w-2.5 h-2.5 text-rose-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">Sweet Compliments</div>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onNavigate('games');
          }}
          className="p-4 rounded-3xl glass-card text-left hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer group shadow-xs hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1">
            Games <Heart className="w-2.5 h-2.5 text-purple-500 fill-current opacity-70" />
          </div>
          <div className="text-[11px] text-stone-500 dark:text-stone-400">Truth or Dare</div>
        </button>
      </section>

      {/* Sealed Love Letter Modal */}
      {isLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/60 dark:border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLetterOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-xs uppercase font-semibold tracking-widest text-rose-500">
                A Letter For {partnerUser.nickname}
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                Our 3-Month Love Letter
              </h3>
              <p className="text-xs text-stone-500 mt-1">July 31, 2026 — Forever & Always</p>
            </div>

            <div className="space-y-4 text-sm sm:text-base font-serif text-stone-800 dark:text-stone-200 leading-relaxed italic border-t border-b border-rose-200/40 dark:border-rose-900/40 py-5">
              <p>My Dearest {partnerUser.nickname},</p>
              <p>
                Three months ago on July 31st, what felt like a dream became our real, beautiful world.
                Ninety-two days have flown by in what feels like both a heartbeat and a lifetime of happiness.
              </p>
              <p>
                Whether it is laughing until our stomachs hurt on late-night calls, sending whispers back and forth,
                or holding your hand in silence, being with you makes every ordinary moment feel magical.
              </p>
              <p>
                Thank you for choosing me every single day. You are my safe haven, my sweet angel, and my best friend.
                Here is to celebrating 3 months of us—and to all the endless chapters waiting ahead.
              </p>
              <p className="text-right font-semibold pt-2">
                Forever yours,<br />
                {activeUser.nickname} 💕
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsLetterOpen(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Close Letter With Love
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Couple Photo Modal */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAddPhotoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Add to Our Polaroids
              </h3>
              <p className="text-xs text-stone-500">
                Saved instantly for both {profile.partner1.nickname} and {profile.partner2.nickname}
              </p>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-3.5">
              {/* File upload or URL */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Choose Photo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-xl glass-card-subtle text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-rose-500 flex items-center justify-center gap-1.5 border border-dashed border-stone-300 dark:border-stone-700 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Phone</span>
                  </button>
                </div>
                <div className="mt-2 text-center text-[10px] text-stone-400">or enter image link below</div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2 rounded-xl glass-card text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Photo preview */}
              {newPhotoUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-rose-300/40">
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Sweet Caption / Story:
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What made this moment unforgettable?"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-card text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Location:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunset Pier"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-card text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPhotoUrl.trim() || !newCaption.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
