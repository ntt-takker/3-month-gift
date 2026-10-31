import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Award,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Search,
  X,
  Share2,
  Trash2,
} from 'lucide-react';
import { Compliment, CoupleProfile, PartnerId } from '../../types';
import { soundEngine } from '../../utils/audio';
import { getRelationshipDays } from '../../utils/storage';

interface ComplimentVaultViewProps {
  compliments: Compliment[];
  profile: CoupleProfile;
  onAddCompliment: (compliment: Omit<Compliment, 'id' | 'timestamp' | 'relationshipDay'>) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteCompliment: (id: string) => void;
}

export default function ComplimentVaultView({
  compliments,
  profile,
  onAddCompliment,
  onToggleFavorite,
  onDeleteCompliment,
}: ComplimentVaultViewProps) {
  // Vault tab: 'her' (stored for partner2) or 'his' (stored for partner1)
  const [activeVault, setActiveVault] = useState<'her' | 'his'>(
    profile.currentViewer === 'partner2' ? 'her' : 'his'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContent, setNewContent] = useState('');

  // Target receiver based on vault
  const targetReceiver: PartnerId = activeVault === 'her' ? 'partner2' : 'partner1';
  const targetSender: PartnerId = activeVault === 'her' ? 'partner1' : 'partner2';

  const receiverProfile = targetReceiver === 'partner1' ? profile.partner1 : profile.partner2;
  const senderProfile = targetSender === 'partner1' ? profile.partner1 : profile.partner2;

  // Filtered compliments in current vault
  const currentVaultCompliments = compliments.filter((c) => {
    if (c.to !== targetReceiver) return false;
    if (onlyFavorites && !c.isFavorite) return false;
    if (searchQuery.trim() && !c.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    onAddCompliment({
      from: targetSender,
      to: targetReceiver,
      content: newContent.trim(),
      isFavorite: false,
    });

    soundEngine.playUnlockSound();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af', '#fb7185'],
    });

    setNewContent('');
    setIsAddModalOpen(false);
  };

  const formatFullDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-current" /> Treasured Forever
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            The Compliment Vault
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Every sweet word, compliment, and loving whisper preserved with exact date and day count
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Save a Compliment
        </button>
      </div>

      {/* Vault Switcher Strip (Apple Glass Segmented Control) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 glass-card-subtle rounded-3xl">
        <div className="grid grid-cols-2 gap-2 flex-1 max-w-md">
          <button
            type="button"
            onClick={() => setActiveVault('her')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
              activeVault === 'her'
                ? 'bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <span>{profile.partner2.avatar}</span>
            <span className="truncate">{profile.partner2.nickname}’s Vault ({compliments.filter((c) => c.to === 'partner2').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVault('his')}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer truncate ${
              activeVault === 'his'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <span>{profile.partner1.avatar}</span>
            <span className="truncate">{profile.partner1.nickname}’s Vault ({compliments.filter((c) => c.to === 'partner1').length})</span>
          </button>
        </div>

        {/* Search & Favorites Filter */}
        <div className="flex items-center gap-2 px-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sweet words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200/50 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyFavorites
                ? 'bg-rose-500/15 border-rose-300 dark:border-rose-500 text-rose-600'
                : 'glass-card border-stone-200/60 dark:border-stone-700 text-stone-600 dark:text-stone-300'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-rose-500' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
          </button>
        </div>
      </div>

      {/* Vault Info Card */}
      <div className="p-5 rounded-3xl glass-card flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="text-2xl p-2.5 rounded-2xl bg-rose-500/15 text-rose-600">
            {receiverProfile.avatar}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              {activeVault === 'her' ? `${receiverProfile.name}'s Vault` : `${receiverProfile.name}'s Vault`}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Sweet words given by {senderProfile.name} (&ldquo;{senderProfile.nickname}&rdquo;)
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {currentVaultCompliments.length} Saved
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">Permanently preserved</div>
        </div>
      </div>

      {/* Compliments Masonry / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentVaultCompliments.length === 0 ? (
          <div className="col-span-full text-center py-12 p-8 rounded-3xl glass-card">
            <Heart className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {searchQuery ? 'No matching compliments found.' : 'No compliments in this vault yet.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium cursor-pointer"
            >
              Add First Compliment
            </button>
          </div>
        ) : (
          currentVaultCompliments.map((compliment) => (
            <div
              key={compliment.id}
              className="p-6 rounded-3xl glass-card transition-all flex flex-col justify-between hover:scale-[1.01]"
            >
              <div>
                {/* Header Tag with Day Count Context */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-current" /> Day {compliment.relationshipDay} Together
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playHeartSound();
                        onToggleFavorite(compliment.id);
                      }}
                      className={`p-1 rounded-full transition-transform active:scale-125 cursor-pointer ${
                        compliment.isFavorite
                          ? 'text-rose-500 fill-current'
                          : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300'
                      }`}
                      title={compliment.isFavorite ? 'Unfavorite' : 'Mark as favorite'}
                    >
                      <Heart className="w-4 h-4" fill={compliment.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playBubblePop();
                        onDeleteCompliment(compliment.id);
                      }}
                      className="p-1 rounded-full text-stone-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete compliment from both apps"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Compliment Quote */}
                <p className="font-serif text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed italic">
                  &ldquo;{compliment.content}&rdquo;
                </p>
              </div>

              {/* Automatic Timestamp & Attribution Metadata */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatFullDate(compliment.timestamp)}
                </span>
                <span className="truncate max-w-[130px]">
                  Given by {senderProfile.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Compliment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Save Words to {receiverProfile.name}&apos;s Vault
                </h3>
                <p className="text-xs text-stone-600">
                  Automatic timestamp and relationship day count will be attached
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  The Compliment / Sweet Words
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={`What did ${senderProfile.name} say that made ${receiverProfile.name} smile?`}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-[11px] text-stone-600 space-y-1">
                <div>• Automatic date: Today ({new Date().toLocaleDateString()})</div>
                <div>• Automatic day count: Day {getRelationshipDays(profile.anniversaryDate)} together</div>
                <div>• Permanent and secure in {receiverProfile.name}&apos;s vault</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Save to Vault ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
