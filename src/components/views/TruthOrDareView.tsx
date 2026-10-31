import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  PhoneCall,
  Coffee,
  Moon,
  Sparkles,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  X,
  HelpCircle,
  Heart,
  Trash2,
} from 'lucide-react';
import { TruthOrDareCard, GameMode, CoupleProfile } from '../../types';
import { soundEngine } from '../../utils/audio';

interface TruthOrDareViewProps {
  cards: TruthOrDareCard[];
  profile: CoupleProfile;
  onAddCustomCard: (card: Omit<TruthOrDareCard, 'id' | 'isCustom'>) => void;
  onDeleteCustomCard: (id: string) => void;
}

export default function TruthOrDareView({
  cards,
  profile,
  onAddCustomCard,
  onDeleteCustomCard,
}: TruthOrDareViewProps) {
  const [currentMode, setCurrentMode] = useState<GameMode>('apart');
  const [cardType, setCardType] = useState<'truth' | 'dare' | null>(null);
  const [activeCard, setActiveCard] = useState<TruthOrDareCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [discreetMode, setDiscreetMode] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Add custom card state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customType, setCustomType] = useState<'truth' | 'dare'>('truth');
  const [customMode, setCustomMode] = useState<GameMode>('apart');
  const [customPrompt, setCustomPrompt] = useState('');

  const modeDetails: Record<
    GameMode,
    { title: string; subtitle: string; icon: typeof PhoneCall; theme: string }
  > = {
    apart: {
      title: 'When Apart',
      subtitle: 'Long distance, calls & sweet nostalgia',
      icon: PhoneCall,
      theme: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-indigo-200 dark:border-indigo-900',
    },
    public: {
      title: 'In Public Together',
      subtitle: 'Sitting at a café, dinner & subtle mischief',
      icon: Coffee,
      theme: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900',
    },
    dark: {
      title: 'Dark Romance',
      subtitle: 'Alone & in the mood, spicy & intense',
      icon: Flame,
      theme: 'bg-gradient-to-br from-rose-500/15 to-purple-950/30 border-rose-400 dark:border-rose-900',
    },
  };

  const drawCard = (type: 'truth' | 'dare') => {
    soundEngine.playHeartSound();
    setCardType(type);

    const available = cards.filter((c) => c.mode === currentMode && c.type === type);
    if (available.length === 0) {
      setActiveCard(null);
      setIsRevealed(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    setActiveCard(available[randomIndex]);
    setIsRevealed(false);
  };

  const handleReveal = () => {
    soundEngine.playUnlockSound();
    setIsRevealed(true);
    if (currentMode === 'dark') {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#881337', '#be123c'],
      });
    }
  };

  const handleComplete = () => {
    soundEngine.playUnlockSound();
    setCompletedCount((prev) => prev + 1);
    setCardType(null);
    setActiveCard(null);
    setIsRevealed(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    onAddCustomCard({
      type: customType,
      mode: customMode,
      prompt: customPrompt.trim(),
      addedBy: profile.currentViewer,
    });

    soundEngine.playHeartSound();
    setCustomPrompt('');
    setIsCustomModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-600 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Intimate Games
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Truth or Dare
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Three curated atmospheres: Apart, Together in Public, and Dark Romance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Discreet Mode Toggle */}
          <button
            type="button"
            onClick={() => setDiscreetMode(!discreetMode)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              discreetMode
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600'
            }`}
            title="Blurs spicy questions until tapped"
          >
            {discreetMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Discreet Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Custom Card
          </button>
        </div>
      </div>

      {/* 3 Game Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['apart', 'public', 'dark'] as const).map((mode) => {
          const detail = modeDetails[mode];
          const Icon = detail.icon;
          const isSelected = currentMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => {
                soundEngine.playHeartSound();
                setCurrentMode(mode);
                setCardType(null);
                setActiveCard(null);
                setIsRevealed(false);
              }}
              className={`p-5 rounded-3xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-rose-500 shadow-xl ' + detail.theme
                  : 'glass-card opacity-75 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    mode === 'dark'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'glass-card-subtle text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {mode === 'dark' ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-xs">
                    <Heart className="w-2.5 h-2.5 fill-current" /> Spicy 18+
                  </span>
                ) : (
                  <Heart className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                )}
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                {detail.title}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{detail.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Central Playing Arena */}
      <div className="max-w-xl mx-auto">
        {!activeCard ? (
          /* Zero State: Choose Truth or Dare */
          <div className="p-8 sm:p-12 rounded-3xl glass-card text-center shadow-lg">
            <span className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-2 block flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-500 fill-current" /> Atmosphere: {modeDetails[currentMode].title}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6 flex items-center justify-center gap-2">
              Pick Your Fate
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => drawCard('truth')}
                className="py-5 px-4 rounded-3xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300/40 dark:border-indigo-500/30 text-lg font-serif font-bold transition-transform active:scale-95 cursor-pointer shadow-xs flex flex-col items-center gap-1"
              >
                <HelpCircle className="w-6 h-6 text-indigo-500" />
                <span>Truth</span>
                <span className="text-[10px] font-sans font-normal opacity-75">Confess everything</span>
              </button>

              <button
                type="button"
                onClick={() => drawCard('dare')}
                className="py-5 px-4 rounded-3xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300/40 dark:border-rose-500/30 text-lg font-serif font-bold transition-transform active:scale-95 cursor-pointer shadow-xs flex flex-col items-center gap-1"
              >
                <Flame className="w-6 h-6 text-rose-500" />
                <span>Dare</span>
                <span className="text-[10px] font-sans font-normal opacity-75">No turning back</span>
              </button>
            </div>

            <div className="mt-8 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-500 fill-current" /> Completed together: {completedCount} rounds
            </div>
          </div>
        ) : (
          /* Active Card Drawn */
          <div className="p-6 sm:p-8 rounded-3xl glass-card text-center relative overflow-hidden shadow-2xl border border-white/50 dark:border-white/10">
            {/* Top Indicator */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {cardType?.toUpperCase()} · {modeDetails[currentMode].title}
              </span>
              <button
                type="button"
                onClick={() => drawCard(cardType!)}
                className="text-xs text-stone-600 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Draw Another
              </button>
            </div>

            {/* Prompt Box */}
            <div className="my-8 min-h-[120px] flex items-center justify-center">
              {!isRevealed ? (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-1">
                    Card Is Face Down
                  </h4>
                  <p className="text-xs text-stone-600 mb-4">
                    Ready to see what you must confess or do?
                  </p>
                  <button
                    type="button"
                    onClick={handleReveal}
                    className="px-6 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
                  >
                    Tap to Flip Card
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p
                    className={`font-serif text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-relaxed italic ${
                      discreetMode ? 'filter blur-sm hover:blur-none transition-all' : ''
                    }`}
                  >
                    &ldquo;{activeCard.prompt}&rdquo;
                  </p>
                  {discreetMode && (
                    <span className="text-[10px] text-stone-600 block mt-2">
                      (Hover or tap to unblur discreet text)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Completion Buttons */}
            {isRevealed && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setCardType(null);
                    setActiveCard(null);
                    setIsRevealed(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Pass / Change
                </button>

                {activeCard?.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBubblePop();
                      onDeleteCustomCard(activeCard.id);
                      setCardType(null);
                      setActiveCard(null);
                      setIsRevealed(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete custom card from both apps"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Card
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleComplete}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" /> Completed! Next Round
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Add Custom Prompt */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Add Secret Truth or Dare
                </h3>
                <p className="text-xs text-stone-600">
                  Write your own prompt for your partner
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomType('truth')}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    customType === 'truth'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white dark:bg-stone-900 border-stone-200'
                  }`}
                >
                  Truth
                </button>
                <button
                  type="button"
                  onClick={() => setCustomType('dare')}
                  className={`py-2 rounded-xl text-xs font-semibold border ${
                    customType === 'dare'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white dark:bg-stone-900 border-stone-200'
                  }`}
                >
                  Dare
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Which atmosphere?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['apart', 'public', 'dark'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCustomMode(mode)}
                      className={`py-2 rounded-xl text-[11px] font-medium border ${
                        customMode === mode
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-white dark:bg-stone-900 border-stone-200 text-stone-600'
                      }`}
                    >
                      {modeDetails[mode].title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Prompt Question or Dare
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type your question or dare..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                >
                  Save to Deck ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
