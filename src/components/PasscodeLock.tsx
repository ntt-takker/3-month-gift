import { useState } from 'react';
import { Heart, Lock, Delete, HelpCircle, Sparkles, Sun, Moon, ShieldCheck, Smartphone } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { CoupleProfile, PartnerId } from '../types';
import { getDeviceOwner, triggerHaptic } from '../utils/androidDevice';

interface PasscodeLockProps {
  profile: CoupleProfile;
  onUnlock: (partnerId: PartnerId) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenAndroidSync?: () => void;
}

export default function PasscodeLock({
  profile,
  onUnlock,
  darkMode = false,
  onToggleDarkMode,
  onOpenAndroidSync,
}: PasscodeLockProps) {
  const [selectedPartner, setSelectedPartner] = useState<PartnerId>(() => {
    const owner = getDeviceOwner();
    return owner || profile.currentViewer || 'partner1';
  });
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const activePartner = profile[selectedPartner];
  const expectedPasscode =
    selectedPartner === 'partner1'
      ? profile.partner1Passcode || '1214'
      : profile.partner2Passcode || '0418';

  const expectedHint =
    selectedPartner === 'partner1'
      ? profile.partner1PasscodeHint || 'My Handsome Goofball’s birthday PIN (1214)'
      : profile.partner2PasscodeHint || 'My Sweet Angel’s birthday PIN (0418)';

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    soundEngine.playHeartSound();
    triggerHaptic('tap');

    if (nextPin.length === 4) {
      if (nextPin === expectedPasscode) {
        soundEngine.playUnlockSound();
        triggerHaptic('unlock');
        setTimeout(() => {
          onUnlock(selectedPartner);
        }, 150);
      } else {
        // Shake error
        setErrorShake(true);
        soundEngine.playBubblePop();
        triggerHaptic('error');
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleSelectPartner = (partnerId: PartnerId) => {
    soundEngine.playBubblePop();
    setSelectedPartner(partnerId);
    setPin('');
    setShowHint(false);
    setErrorShake(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF8F5] dark:bg-[#0F0E11] px-4 transition-colors overflow-hidden">
      {/* Apple-style dynamic ambient glowing backdrops */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-400/25 dark:bg-rose-600/15 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-pink-400/20 dark:bg-pink-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-amber-300/20 dark:bg-purple-900/15 blur-3xl" />

        {/* Floating Romantic Hearts */}
        <div className="absolute top-12 left-10 text-rose-300/40 dark:text-rose-500/20 animate-floating-heart">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div className="absolute top-1/4 right-12 text-pink-300/40 dark:text-pink-500/20 animate-floating-heart-delay-1">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute bottom-20 left-16 text-rose-300/30 dark:text-rose-500/15 animate-floating-heart-delay-2">
          <Heart className="w-10 h-10 fill-current" />
        </div>
        <div className="absolute bottom-1/3 right-8 text-rose-400/35 dark:text-rose-400/20 animate-floating-heart">
          <Heart className="w-5 h-5 fill-current" />
        </div>
      </div>

      {/* Top right theme toggle */}
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="absolute top-5 right-5 w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-stone-700 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs z-10"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Romantic Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>
      )}

      {/* Apple-style Frosted Glass Card Container */}
      <div className="relative w-full max-w-sm glass-card rounded-3xl p-7 flex flex-col items-center text-center shadow-2xl z-10 border border-white/60 dark:border-white/10">
        {/* Cute MS Verse App Icon with lock badge */}
        <div className="relative mb-3 group">
          <img
            src="/icon.svg"
            alt="MS Verse Icon"
            className="w-16 h-16 rounded-2xl shadow-lg shadow-rose-500/25 object-cover border border-rose-200/50 dark:border-rose-800/50 group-hover:scale-105 transition-transform"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-stone-900">
            <Lock className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        <span className="text-[11px] uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> MS Verse · Private Sanctuary
        </span>
        <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-1 flex items-center gap-1.5">
          {profile.partner1.nickname} & {profile.partner2.nickname}
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 mb-4 max-w-[260px]">
          Select your side to unlock your private space
        </p>

        {/* Partner Login Selector (Apple-style Segmented Glass Control) */}
        <div className="w-full grid grid-cols-2 gap-2 p-1.5 rounded-2xl glass-card-subtle mb-4 border border-white/50 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleSelectPartner('partner1')}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedPartner === 'partner1'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm ring-1 ring-rose-400/30'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span>{profile.partner1.avatar}</span>
            <span className="truncate">{profile.partner1.nickname}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPartner('partner2')}
            className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedPartner === 'partner2'
                ? 'bg-white dark:bg-stone-800 text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-400/30'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span>{profile.partner2.avatar}</span>
            <span className="truncate">{profile.partner2.nickname}</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-500 dark:text-stone-400 mb-4 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
          <span>Enter {activePartner.nickname}’s private PIN</span>
        </div>

        {/* PIN Heart Dots */}
        <div
          className={`flex items-center gap-4 mb-5 transition-transform ${
            errorShake ? 'animate-bounce text-rose-600' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isFilled
                    ? 'scale-125 text-rose-500 drop-shadow-sm'
                    : 'text-stone-300 dark:text-stone-700'
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFilled ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </div>
            );
          })}
        </div>

        {/* Numeric Keypad (Apple glass circles) */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-13 rounded-2xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xl font-medium text-stone-800 dark:text-stone-100 shadow-2xs hover:border-rose-400 dark:hover:border-rose-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="h-13 rounded-2xl glass-card-subtle text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Hint"
          >
            <HelpCircle className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xl font-medium text-stone-800 dark:text-stone-100 shadow-2xs hover:border-rose-400 dark:hover:border-rose-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-13 rounded-2xl glass-card-subtle text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            title="Delete"
          >
            <Delete className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Hint Disclosure */}
        {showHint && (
          <div className="p-3 glass-card rounded-2xl text-xs text-stone-700 dark:text-stone-300 border border-rose-200/50 dark:border-rose-900/50 animate-fade-in w-full mt-1">
            <span className="font-semibold text-rose-500">Hint for {activePartner.nickname}: </span>
            {expectedHint}
          </div>
        )}

        {/* Android App & Pair Phones Quick Access */}
        {onOpenAndroidSync && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              triggerHaptic('tap');
              onOpenAndroidSync();
            }}
            className="mt-4 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1.5 py-1.5 px-3 rounded-full glass-card-subtle transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            <span>Install on Android & Pair Partner</span>
          </button>
        )}
      </div>
    </div>
  );
}
