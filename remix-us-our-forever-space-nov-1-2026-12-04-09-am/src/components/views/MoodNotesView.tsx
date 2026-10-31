import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Smile,
  Heart,
  Gift,
  Send,
  Sparkles,
  Camera,
  Eye,
  Lock,
  Plus,
  Clock,
  X,
  Upload,
} from 'lucide-react';
import { DailyMood, LoveDrop, CoupleProfile, PartnerId } from '../../types';
import { soundEngine } from '../../utils/audio';

interface MoodNotesViewProps {
  moods: Record<PartnerId, DailyMood>;
  loveDrops: LoveDrop[];
  profile: CoupleProfile;
  onUpdateMood: (partner: PartnerId, emoji: string, statusText: string) => void;
  onSendPoke: (type: 'hug' | 'kiss' | 'love') => void;
  onAddLoveDrop: (drop: Omit<LoveDrop, 'id' | 'timestamp' | 'heartCount' | 'isRevealed'>) => void;
  onRevealDrop: (id: string) => void;
  onReactDrop: (id: string) => void;
}

const MOOD_EMOJIS = ['🥰', '💖', '😊', '🥺', '😴', '☕', '🍕', '🌸', '✨', '🔥'];

export default function MoodNotesView({
  moods,
  loveDrops,
  profile,
  onUpdateMood,
  onSendPoke,
  onAddLoveDrop,
  onRevealDrop,
  onReactDrop,
}: MoodNotesViewProps) {
  const activeViewer = profile.currentViewer;
  const partnerId: PartnerId = activeViewer === 'partner1' ? 'partner2' : 'partner1';

  const myMood = moods[activeViewer];
  const partnerMood = moods[partnerId];

  const myProfile = activeViewer === 'partner1' ? profile.partner1 : profile.partner2;
  const partnerProfile = activeViewer === 'partner1' ? profile.partner2 : profile.partner1;

  // Mood update form state
  const [selectedEmoji, setSelectedEmoji] = useState(myMood?.emoji || '🥰');
  const [statusInput, setStatusInput] = useState(myMood?.statusText || '');
  const [isUpdatingMood, setIsUpdatingMood] = useState(false);

  // Love drop form modal state
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);
  const [dropType, setDropType] = useState<'note' | 'photo'>('note');
  const [dropContent, setDropContent] = useState('');
  const [dropPhotoUrl, setDropPhotoUrl] = useState('');
  const [isSurprise, setIsSurprise] = useState(true);

  const handleSaveMood = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMood(activeViewer, selectedEmoji, statusInput.trim() || 'Thinking of you');
    soundEngine.playHeartSound();
    setIsUpdatingMood(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDropPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropContent.trim() && !dropPhotoUrl.trim()) return;

    onAddLoveDrop({
      from: activeViewer,
      to: partnerId,
      type: dropType,
      content: dropContent.trim(),
      photoUrl: dropType === 'photo' ? dropPhotoUrl : undefined,
      isSurprise,
    });

    soundEngine.playUnlockSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af'],
    });

    setDropContent('');
    setDropPhotoUrl('');
    setIsDropModalOpen(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.max(0, Date.now() - timestamp);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-rose-500" /> Daily Connection
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Mood & Love Drops
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Share how you feel and leave surprise love notes for each other
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDropModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs"
        >
          <Gift className="w-4 h-4" /> Drop a Love Note or Photo
        </button>
      </div>

      {/* SECTION 1: Daily Mood Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* My Mood Card (Apple Glass Styling) */}
        <div className="p-6 rounded-3xl glass-card flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                Your Current Mood ({myProfile.name}) <Heart className="w-3 h-3 text-rose-500 fill-current" />
              </span>
              <button
                type="button"
                onClick={() => setIsUpdatingMood(!isUpdatingMood)}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
              >
                {isUpdatingMood ? 'Cancel' : 'Change Mood'}
              </button>
            </div>

            {isUpdatingMood ? (
              <form onSubmit={handleSaveMood} className="space-y-3 mt-2">
                <div className="flex flex-wrap gap-2">
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-2xl p-2 rounded-xl transition-transform active:scale-110 cursor-pointer ${
                        selectedEmoji === emoji
                          ? 'bg-rose-100 dark:bg-rose-950/60 ring-2 ring-rose-400'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Short note (e.g. Counting down to our call!)"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                >
                  Save My Mood
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-4 py-2">
                <div className="text-4xl p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700/50 shadow-2xs">
                  {myMood?.emoji || '🥰'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    &ldquo;{myMood?.statusText || 'Feeling happy'}&rdquo;
                  </div>
                  <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated {formatTimeAgo(myMood?.updatedAt || Date.now())}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-[11px] text-stone-600 pt-3 border-t border-stone-100 dark:border-stone-800">
            Visible instantly to {partnerProfile.name}
          </div>
        </div>

        {/* Partner Mood Card (Apple Glass Styling) */}
        <div className="p-6 rounded-3xl glass-card bg-rose-500/10 dark:bg-rose-500/15 border-rose-300/40 dark:border-rose-500/25 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                {partnerProfile.name}&apos;s Mood (&ldquo;{partnerProfile.nickname}&rdquo;)
                <Heart className="w-3 h-3 text-rose-500 fill-current" />
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Updated {formatTimeAgo(partnerMood?.updatedAt || Date.now())}
              </span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="text-4xl p-3 rounded-2xl bg-white dark:bg-stone-800 border border-rose-100 dark:border-rose-900/40 shadow-2xs">
                {partnerMood?.emoji || '💖'}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  &ldquo;{partnerMood?.statusText || 'Missing you'}&rdquo;
                </div>
                <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  Status set by {partnerProfile.name}
                </div>
              </div>
            </div>
          </div>

          {/* Quick React Bar */}
          <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
            <span className="text-xs text-stone-600">Brighten their day:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSendPoke('hug')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200 shadow-2xs hover:bg-stone-50 active:scale-95 transition-transform"
              >
                🫂 Hug
              </button>
              <button
                type="button"
                onClick={() => onSendPoke('kiss')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-xs font-medium text-rose-600 dark:text-rose-400 shadow-2xs hover:bg-stone-50 active:scale-95 transition-transform"
              >
                💋 Kiss
              </button>
              <button
                type="button"
                onClick={() => onSendPoke('love')}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-xs font-medium text-white shadow-2xs hover:bg-rose-700 active:scale-95 transition-transform"
              >
                💖 Love
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: "For You" Love Drops Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" /> &ldquo;For You&rdquo; Notes & Surprise Drops
          </h2>
          <span className="text-xs text-stone-600">
            {loveDrops.length} drops left for each other
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loveDrops.map((drop) => {
            const isForMe = drop.to === activeViewer;
            const sender = drop.from === 'partner1' ? profile.partner1 : profile.partner2;
            const receiver = drop.to === 'partner1' ? profile.partner1 : profile.partner2;

            // If it's a surprise and not revealed yet
            const isHiddenSurprise = drop.isSurprise && !drop.isRevealed;

            return (
              <div
                key={drop.id}
                className={`p-6 rounded-3xl transition-all flex flex-col justify-between ${
                  isHiddenSurprise
                    ? 'bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-amber-500/15 glass-card border-rose-300/50 dark:border-rose-500/40 shadow-md'
                    : 'glass-card hover:scale-[1.01]'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-stone-600 flex items-center gap-1">
                      <span>{sender.avatar}</span> From {sender.name} to {receiver.name}
                    </span>
                    <span className="text-[10px] text-stone-600">
                      {formatTimeAgo(drop.timestamp)}
                    </span>
                  </div>

                  {/* Body Content */}
                  {isHiddenSurprise ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-2 animate-bounce">
                        <Gift className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {isForMe ? 'Surprise Sealed for You!' : 'Sealed Surprise Sent'}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 mb-4">
                        {isForMe
                          ? `${sender.name} left a special surprise note for you.`
                          : `Waiting for ${receiver.name} to open.`}
                      </p>

                      {isForMe ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playUnlockSound();
                            confetti({
                              particleCount: 50,
                              spread: 70,
                              origin: { y: 0.7 },
                            });
                            onRevealDrop(drop.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
                        >
                          ✨ Tap to Reveal Surprise
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-stone-600">
                          <Lock className="w-3.5 h-3.5" /> Sealed until opened
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {drop.type === 'photo' && drop.photoUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden aspect-4/3 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                          <img
                            src={drop.photoUrl}
                            alt="Love drop"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <p className="font-serif text-sm text-stone-800 dark:text-stone-200 leading-relaxed italic">
                        &ldquo;{drop.content}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Reactions */}
                {!isHiddenSurprise && (
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-rose-500 font-medium">
                      Opened with love
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playHeartSound();
                        onReactDrop(drop.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-xs font-medium hover:bg-rose-100 active:scale-95 transition-transform"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{drop.heartCount}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Love Drop */}
      {isDropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Leave a Love Drop for {partnerProfile.name}
                </h3>
                <p className="text-xs text-stone-600">
                  A sweet surprise note or photo just for them
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDropModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrop} className="space-y-4">
              <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setDropType('note')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    dropType === 'note'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-500'
                  }`}
                >
                  Love Note
                </button>
                <button
                  type="button"
                  onClick={() => setDropType('photo')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    dropType === 'photo'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                      : 'text-stone-500'
                  }`}
                >
                  Photo & Note
                </button>
              </div>

              {dropType === 'photo' && (
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Photo (Upload or Image URL)
                  </label>
                  <label className="w-full mb-2 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-50 flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>Upload photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={dropPhotoUrl}
                    onChange={(e) => setDropPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                  />
                  {dropPhotoUrl && (
                    <div className="mt-2 h-28 rounded-xl overflow-hidden border">
                      <img
                        src={dropPhotoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Your Message
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What would you like to tell them right now?"
                  value={dropContent}
                  onChange={(e) => setDropContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="surpriseToggle"
                  checked={isSurprise}
                  onChange={(e) => setIsSurprise(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="surpriseToggle" className="text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                  Make it a mystery surprise card (tap to reveal) ✨
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDropModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Drop Surprise 💖
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
