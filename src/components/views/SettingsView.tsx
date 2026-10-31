import { useState } from 'react';
import {
  Settings,
  Lock,
  Heart,
  Calendar,
  Download,
  Upload,
  UserCheck,
  AlertCircle,
  Check,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react';
import { CoupleProfile, PartnerId } from '../../types';
import { soundEngine } from '../../utils/audio';

interface SettingsViewProps {
  profile: CoupleProfile;
  onUpdateProfile: (profile: CoupleProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onOpenAndroidSync?: () => void;
}

export default function SettingsView({
  profile,
  onUpdateProfile,
  onExportBackup,
  onImportBackup,
  onOpenAndroidSync,
}: SettingsViewProps) {
  const activeViewer = profile.currentViewer;
  const isP1Active = activeViewer === 'partner1';

  // State for editable values
  const [partner1Name, setPartner1Name] = useState(profile.partner1.name);
  const [partner2Name, setPartner2Name] = useState(profile.partner2.name);

  // Nicknames: Partner 1 can only edit Partner 2's nickname; Partner 2 can only edit Partner 1's nickname!
  const [p1Nickname, setP1Nickname] = useState(profile.partner1.nickname);
  const [p2Nickname, setP2Nickname] = useState(profile.partner2.nickname);

  const [p1Avatar, setP1Avatar] = useState(profile.partner1.avatar);
  const [p2Avatar, setP2Avatar] = useState(profile.partner2.avatar);

  const [anniversaryDate, setAnniversaryDate] = useState(profile.anniversaryDate);
  const [p1Birthday, setP1Birthday] = useState(profile.partner1.birthday);
  const [p2Birthday, setP2Birthday] = useState(profile.partner2.birthday);

  // Passcode states
  const [passcode, setPasscode] = useState(profile.passcode);
  const [passcodeHint, setPasscodeHint] = useState(profile.passcodeHint);
  const [p1Passcode, setP1Passcode] = useState(profile.partner1Passcode || '1214');
  const [p1PasscodeHint, setP1PasscodeHint] = useState(profile.partner1PasscodeHint || 'My Handsome Goofball’s birthday PIN (1214)');
  const [p2Passcode, setP2Passcode] = useState(profile.partner2Passcode || '0418');
  const [p2PasscodeHint, setP2PasscodeHint] = useState(profile.partner2PasscodeHint || 'My Sweet Angel’s birthday PIN (0418)');
  const [darkMode, setDarkMode] = useState(Boolean(profile.darkMode));

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CoupleProfile = {
      ...profile,
      anniversaryDate,
      passcode: passcode.trim() || '0731',
      passcodeHint: passcodeHint.trim() || 'Our special date',
      partner1Passcode: p1Passcode.trim() || '1214',
      partner1PasscodeHint: p1PasscodeHint.trim(),
      partner2Passcode: p2Passcode.trim() || '0418',
      partner2PasscodeHint: p2PasscodeHint.trim(),
      darkMode,
      partner1: {
        ...profile.partner1,
        name: partner1Name.trim() || 'Partner 1',
        nickname: !isP1Active ? p1Nickname.trim() : profile.partner1.nickname,
        avatar: p1Avatar,
        birthday: p1Birthday,
      },
      partner2: {
        ...profile.partner2,
        name: partner2Name.trim() || 'Partner 2',
        nickname: isP1Active ? p2Nickname.trim() : profile.partner2.nickname,
        avatar: p2Avatar,
        birthday: p2Birthday,
      },
    };

    onUpdateProfile(updated);
    soundEngine.playUnlockSound();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = onImportBackup(text);
          if (success) {
            setImportStatus('Backup restored successfully! Refreshing...');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            setImportStatus('Failed to import backup file. Check file format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-3xl mx-auto relative z-10">
      {/* Header */}
      <div className="border-b border-stone-200/50 dark:border-stone-800/60 pb-6">
        <span className="text-xs uppercase tracking-widest text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5" /> Couple Space Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          Settings & Theme
          <Heart className="w-4 h-4 text-rose-500 fill-current" />
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
          Manage pet names, Apple glass aesthetics, dark mode, passcodes, and backups
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION: Android App & 24/7 Pair Sync */}
        <div className="p-6 rounded-3xl glass-card space-y-3 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" /> Android App & Partner Pair Hub
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              24/7 Live Sync
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Install this sanctuary as a native Android WebAPK on both your phone and your girlfriend’s phone. Scan the pairing QR code, configure phone ownership, and test haptic vibrations.
          </p>
          {onOpenAndroidSync && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                onOpenAndroidSync();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-emerald-600/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              Open Android Installation & QR Pairing Hub
            </button>
          )}
        </div>

        {/* SECTION 0: Theme & Glass Layout Mode */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Theme & Appearance
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium">
              Apple Glass Design
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                !darkMode
                  ? 'bg-white/90 border-rose-300 ring-2 ring-rose-400/50 shadow-sm text-stone-900'
                  : 'glass-card-subtle opacity-70 hover:opacity-100 text-stone-700 dark:text-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold">Warm Linen Light</div>
                <div className="text-[10px] text-stone-500">Cream & Rose Glass</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                darkMode
                  ? 'bg-stone-900/90 border-rose-500 ring-2 ring-rose-500/50 shadow-sm text-white'
                  : 'glass-card-subtle opacity-70 hover:opacity-100 text-stone-700 dark:text-stone-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold">Romantic Dark Mode</div>
                <div className="text-[10px] text-stone-400">Midnight Glow & Velvet</div>
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 1: Mutual Nickname Control (User's Core Rule!) */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-current" /> Partner Nicknames & Rules
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-medium">
              Mutual Control Enforced
            </span>
          </div>

          <div className="p-3 glass-card-subtle rounded-2xl text-xs text-stone-600 dark:text-stone-300 flex items-start gap-2 border border-white/40 dark:border-white/5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Rule:</strong> You can only set and change your partner&apos;s nickname—not your own!
              Switch between &ldquo;Viewing as {profile.partner1.name}&rdquo; and &ldquo;Viewing as {profile.partner2.name}&rdquo; in the top bar to update each other.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Partner 1 (Him) Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              !isP1Active
                ? 'glass-card border-rose-300/60 dark:border-rose-500/40 ring-1 ring-rose-400/30'
                : 'glass-card-subtle opacity-90'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {profile.partner1.name}&apos;s Profile
                </span>
                {!isP1Active ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    You can edit (as {profile.partner2.name})
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium bg-stone-200/50 dark:bg-stone-700/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Set only by Her
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Real Name
                  </label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Nickname (Given by {profile.partner2.name})
                  </label>
                  <input
                    type="text"
                    disabled={isP1Active}
                    value={p1Nickname}
                    onChange={(e) => setP1Nickname(e.target.value)}
                    title={isP1Active ? 'You cannot set your own nickname!' : ''}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      isP1Active
                        ? 'bg-stone-100/70 dark:bg-stone-800/70 text-stone-500 cursor-not-allowed border-stone-200 dark:border-stone-700'
                        : 'border-rose-300 dark:border-rose-600 bg-white dark:bg-stone-900 font-medium text-rose-700 dark:text-rose-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={p1Birthday}
                    onChange={(e) => setP1Birthday(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            {/* Partner 2 (Her) Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              isP1Active
                ? 'glass-card border-rose-300/60 dark:border-rose-500/40 ring-1 ring-rose-400/30'
                : 'glass-card-subtle opacity-90'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {profile.partner2.name}&apos;s Profile
                </span>
                {isP1Active ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    You can edit (as {profile.partner1.name})
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium bg-stone-200/50 dark:bg-stone-700/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Set only by Him
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Real Name
                  </label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Nickname (Given by {profile.partner1.name})
                  </label>
                  <input
                    type="text"
                    disabled={!isP1Active}
                    value={p2Nickname}
                    onChange={(e) => setP2Nickname(e.target.value)}
                    title={!isP1Active ? 'You cannot set your own nickname!' : ''}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs ${
                      !isP1Active
                        ? 'bg-stone-100/70 dark:bg-stone-800/70 text-stone-500 cursor-not-allowed border-stone-200 dark:border-stone-700'
                        : 'border-rose-300 dark:border-rose-600 bg-white dark:bg-stone-900 font-medium text-rose-700 dark:text-rose-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={p2Birthday}
                    onChange={(e) => setP2Birthday(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Passcode & Private Side Security */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" /> Private Side Passcodes & Privacy
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
              Separate Access Enforced
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400">
            Each partner has their own secret 4-digit PIN to login to their side only. You cannot access each other&apos;s side without that partner&apos;s secret passcode.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Partner 1 Passcode */}
            <div className={`p-4 rounded-2xl border ${
              isP1Active ? 'glass-card border-rose-300 dark:border-rose-600' : 'glass-card-subtle opacity-80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{profile.partner1.avatar}</span>
                  <span>{profile.partner1.nickname}’s PIN</span>
                </span>
                {isP1Active ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    You can change
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private to Him
                  </span>
                )}
              </div>

              {isP1Active ? (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                      Your Private 4-Digit PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={p1Passcode}
                      onChange={(e) => setP1Passcode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-600 bg-white dark:bg-stone-900 text-sm font-mono tracking-widest text-center text-rose-600 dark:text-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                      PIN Hint
                    </label>
                    <input
                      type="text"
                      value={p1PasscodeHint}
                      onChange={(e) => setP1PasscodeHint(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-stone-400 dark:text-stone-500 italic">
                  •••• (Protected by {profile.partner1.nickname})
                </div>
              )}
            </div>

            {/* Partner 2 Passcode */}
            <div className={`p-4 rounded-2xl border ${
              !isP1Active ? 'glass-card border-rose-300 dark:border-rose-600' : 'glass-card-subtle opacity-80'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <span>{profile.partner2.avatar}</span>
                  <span>{profile.partner2.nickname}’s PIN</span>
                </span>
                {!isP1Active ? (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-md">
                    You can change
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private to Her
                  </span>
                )}
              </div>

              {!isP1Active ? (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                      Your Private 4-Digit PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={p2Passcode}
                      onChange={(e) => setP2Passcode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-600 bg-white dark:bg-stone-900 text-sm font-mono tracking-widest text-center text-rose-600 dark:text-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                      PIN Hint
                    </label>
                    <input
                      type="text"
                      value={p2PasscodeHint}
                      onChange={(e) => setP2PasscodeHint(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-stone-400 dark:text-stone-500 italic">
                  •••• (Protected by {profile.partner2.nickname})
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Official Anniversary Date */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" /> Anniversary Start Date
          </h2>
          <div>
            <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
              The Day You Officially Started Dating
            </label>
            <input
              type="date"
              required
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="max-w-xs w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              All live counters, milestone markers, and compliment day counts calculate from this day.
            </p>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in">
              <Check className="w-4 h-4" /> Preferences saved successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold shadow-md shadow-rose-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            Save All Preferences ✨
          </button>
        </div>
      </form>

      {/* SECTION 4: Backup & Restore Memories */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div>
          <h2 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" /> 1-Click Backup & Restore
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Safeguard all your photos, compliments, to-dos, and memories by downloading a backup file.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onExportBackup}
            className="px-4 py-2.5 rounded-2xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-rose-500" />
            Download Complete Memories Backup (.json)
          </button>

          <label className="px-4 py-2.5 rounded-2xl glass-card hover:bg-white/90 dark:hover:bg-stone-800 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all">
            <Upload className="w-4 h-4 text-blue-500" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <div className="p-3 glass-card rounded-xl text-xs font-medium text-stone-800 dark:text-stone-200">
            {importStatus}
          </div>
        )}
      </div>
    </div>
  );
}
