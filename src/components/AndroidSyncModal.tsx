import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  Check,
  X,
  Heart,
  Vibrate,
  Moon,
  Bell,
  Sparkles,
  Radio,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { CoupleProfile, PartnerId } from '../types';
import { soundEngine } from '../utils/audio';
import {
  isAndroidUserAgent,
  isStandaloneMode,
  triggerHaptic,
  getDeviceOwner,
  setDeviceOwner,
  requestAndroidNotificationPermission,
  wakeLockController,
  generateAndroidProjectBundle,
} from '../utils/androidDevice';
import { syncService } from '../utils/syncService';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CoupleProfile;
  onSwitchViewer: (viewer: PartnerId) => void;
}

export const AndroidSyncModal: React.FC<AndroidSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSwitchViewer,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeSection, setActiveSection] = useState<'install' | 'pair' | 'owner' | 'hardware'>('install');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<PartnerId>(() => getDeviceOwner() || profile.currentViewer);
  const [isWakeLocked, setIsWakeLocked] = useState(wakeLockController.isLocked());
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [syncDetails, setSyncDetails] = useState(() => syncService.getSyncDetails());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showTwaBundle, setShowTwaBundle] = useState(false);

  const isAndroid = typeof navigator !== 'undefined' && isAndroidUserAgent();
  const isInstalledApp = isInstalled || (typeof window !== 'undefined' && isStandaloneMode());
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ms-verse.app';

  // Generate QR Code for partner pairing
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    QRCode.toDataURL(currentAppUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1a181d',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed generating QR code:', err));
  }, [isOpen, currentAppUrl]);

  // Update sync status periodically
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSyncDetails(syncService.getSyncDetails());
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    soundEngine.playBubblePop();
    triggerHaptic('tap');
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        soundEngine.playSuccess();
        triggerHaptic('success');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  const handleCopyLink = () => {
    soundEngine.playSuccess();
    triggerHaptic('tap');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareInvite = async () => {
    soundEngine.playBubblePop();
    triggerHaptic('tap');
    const shareText = `My love, open this link to install our private sanctuary app on your Android phone: ${currentAppUrl} 💕`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'MS Verse — Our Forever Space',
          text: shareText,
          url: currentAppUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSelectOwner = (ownerId: PartnerId) => {
    soundEngine.playUnlockSound();
    triggerHaptic('tap');
    setCurrentOwner(ownerId);
    setDeviceOwner(ownerId);
    onSwitchViewer(ownerId);
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
  };

  const handleTestHaptic = (type: 'kiss' | 'hug' | 'heartbeat') => {
    soundEngine.playHeartSound();
    triggerHaptic(type);
  };

  const handleToggleWakeLock = async () => {
    soundEngine.playBubblePop();
    if (isWakeLocked) {
      wakeLockController.releaseLock();
      setIsWakeLocked(false);
    } else {
      const ok = await wakeLockController.requestLock();
      setIsWakeLocked(ok);
      if (ok) {
        triggerHaptic('tap');
      }
    }
  };

  const handleRequestNotifications = async () => {
    soundEngine.playBubblePop();
    const ok = await requestAndroidNotificationPermission();
    setNotificationStatus(ok ? 'granted' : 'denied');
    if (ok) {
      triggerHaptic('success');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    soundEngine.playBubblePop();
    triggerHaptic('tap');
    await syncService.fetchInitialState();
    setSyncDetails(syncService.getSyncDetails());
    setTimeout(() => {
      setIsManualSyncing(false);
      soundEngine.playSuccess();
    }, 600);
  };

  const twaBundle = generateAndroidProjectBundle(currentAppUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl glass-card border border-white/40 dark:border-white/10 shadow-2xl p-5 sm:p-7 text-left my-auto space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-2xl glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer transition-all hover:scale-105 active:scale-95"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                24/7 Live Android Companion
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Both Phones Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Android App & Partner Pair
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              Install the native Android app on your phone and your girlfriend’s phone with continuous real-time sync.
            </p>
          </div>
        </div>

        {/* Live 24/7 Sync Status Bar */}
        <div className="p-3.5 rounded-2xl glass-card-subtle flex items-center justify-between border border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                24/7 Cloud Sync Active
                <span className="text-[10px] font-normal text-stone-500">
                  (last synced {Math.round((Date.now() - syncDetails.lastSyncTime) / 1000)}s ago)
                </span>
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Messages, polaroids, mood, dates & pokes sync instantaneously across devices.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleForceSync}
            disabled={isManualSyncing}
            className="p-2 rounded-xl glass-card hover:bg-white/80 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Force re-sync now"
          >
            <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl glass-card-subtle text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSection('install')}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeSection === 'install'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            📱 This Phone
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('pair')}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeSection === 'pair'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            QR Partner Pair
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('owner')}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeSection === 'owner'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            👤 Device Owner
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('hardware')}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeSection === 'hardware'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            ⚡ Android Tools
          </button>
        </div>

        {/* SECTION 1: Install on This Android Phone */}
        {activeSection === 'install' && (
          <div className="space-y-4 animate-fade-in">
            {isInstalledApp ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    MS Verse is Installed as a Native Android WebAPK!
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Running in standalone display mode with launcher shortcuts, offline caching, and native vibration.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Install to Android Home Screen
                      <Sparkles className="w-4 h-4 text-rose-500" />
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      Installs a full Android application package (WebAPK) with zero clutter.
                    </p>
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-md hover:shadow-emerald-600/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5 animate-bounce" />
                    Install Android App Now (1-Tap WebAPK)
                  </button>
                ) : (
                  <div className="space-y-2.5 p-3 rounded-xl bg-stone-100/60 dark:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">
                      How to install on Android Chrome / Samsung Internet:
                    </p>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        1
                      </span>
                      <span>
                        Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of your browser.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        2
                      </span>
                      <span>
                        Select <strong>“Install app”</strong> or <strong>“Add to Home screen”</strong>.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        3
                      </span>
                      <span>
                        Tap <strong>“Install”</strong>. The icon will appear right on your phone home screen!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Android WebAPK Features */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Android Native Features Included:
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl glass-card-subtle flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No browser address bar</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card-subtle flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Launcher Quick Shortcuts</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card-subtle flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real Haptic Vibrations</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card-subtle flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Offline memory access</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Pair Girlfriend's Phone (QR Code) */}
        {activeSection === 'pair' && (
          <div className="space-y-4 animate-fade-in text-center">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Have your girlfriend scan this QR code with her Android Camera or Chrome to open and install the app in 5 seconds!
            </p>

            <div className="flex justify-center py-2">
              <div className="p-3 bg-white rounded-3xl shadow-xl inline-block border-4 border-rose-200 dark:border-rose-900/40">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Pairing QR Code" className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-xl" />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-stone-400">
                    Generating QR code...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareInvite}
                className="py-2.5 px-4 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md hover:shadow-rose-500/25 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Link via WhatsApp / SMS
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl glass-card text-stone-700 dark:text-stone-200 text-xs font-medium hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: Device Ownership */}
        {activeSection === 'owner' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Select who owns this specific Android device. When you open the app on your phone, it will automatically recognize you, while your girlfriend’s phone will recognize her!
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Partner 1 (Him) */}
              <div
                onClick={() => handleSelectOwner('partner1')}
                className={`p-4 rounded-2xl glass-card cursor-pointer transition-all border-2 ${
                  currentOwner === 'partner1'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5'
                    : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="text-3xl mb-2">{profile.partner1.avatar}</div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  {profile.partner1.name}
                  {currentOwner === 'partner1' && <Check className="w-4 h-4 text-rose-500" />}
                </h4>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                  {profile.partner1.nickname}
                </p>
                <p className="text-[10px] text-stone-500 mt-2">
                  PIN: {profile.partner1Passcode || '1214'}
                </p>
              </div>

              {/* Partner 2 (Her) */}
              <div
                onClick={() => handleSelectOwner('partner2')}
                className={`p-4 rounded-2xl glass-card cursor-pointer transition-all border-2 ${
                  currentOwner === 'partner2'
                    ? 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-500/5'
                    : 'border-transparent hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="text-3xl mb-2">{profile.partner2.avatar}</div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  {profile.partner2.name}
                  {currentOwner === 'partner2' && <Check className="w-4 h-4 text-pink-500" />}
                </h4>
                <p className="text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                  {profile.partner2.nickname}
                </p>
                <p className="text-[10px] text-stone-500 mt-2">
                  PIN: {profile.partner2Passcode || '0418'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs border border-amber-500/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Both phones share all photos, chats, notes, and milestones, but remain tailored to the phone's owner.
              </span>
            </div>
          </div>
        )}

        {/* SECTION 4: Android Hardware & Tools */}
        {activeSection === 'hardware' && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Haptic Vibrations */}
            <div className="p-3.5 rounded-2xl glass-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Vibrate className="w-4 h-4 text-rose-500" /> Android Haptic Motor Feedback
                </span>
                <span className="text-[10px] text-stone-500">vibrate API</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 text-[11px]">
                Feel physical vibrations on your Android device when kisses, hugs, or hearts arrive!
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleTestHaptic('kiss')}
                  className="px-3 py-1.5 rounded-xl glass-card-subtle text-stone-800 dark:text-stone-200 hover:scale-105 active:scale-95 cursor-pointer font-medium"
                >
                  💋 Feel Kiss Vibe
                </button>
                <button
                  type="button"
                  onClick={() => handleTestHaptic('hug')}
                  className="px-3 py-1.5 rounded-xl glass-card-subtle text-stone-800 dark:text-stone-200 hover:scale-105 active:scale-95 cursor-pointer font-medium"
                >
                  🫂 Feel Hug Vibe
                </button>
                <button
                  type="button"
                  onClick={() => handleTestHaptic('heartbeat')}
                  className="px-3 py-1.5 rounded-xl glass-card-subtle text-stone-800 dark:text-stone-200 hover:scale-105 active:scale-95 cursor-pointer font-medium"
                >
                  💓 Feel Heartbeat
                </button>
              </div>
            </div>

            {/* WakeLock / Bedside Mode */}
            <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" /> Bedside Screen WakeLock
                </span>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5">
                  Keep screen on while on your nightstand so the romantic clock stays glowing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleWakeLock}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isWakeLocked
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'glass-card text-stone-700 dark:text-stone-300'
                }`}
              >
                {isWakeLocked ? 'Active' : 'Enable'}
              </button>
            </div>

            {/* Android Push Notifications */}
            <div className="p-3.5 rounded-2xl glass-card flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" /> Android System Notifications
                </span>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5">
                  Show heads-up Android banners when partner sends kisses or whispers.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRequestNotifications}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-600 text-white'
                    : 'glass-card text-stone-700 dark:text-stone-300'
                }`}
              >
                {notificationStatus === 'granted' ? 'Allowed' : 'Allow'}
              </button>
            </div>

            {/* TWA / Android Studio APK generation info toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTwaBundle(!showTwaBundle)}
                className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 text-[11px] underline cursor-pointer"
              >
                {showTwaBundle ? 'Hide Android Studio / CLI Build Code' : 'View Android Studio / Bubblewrap APK Build Code'}
              </button>

              {showTwaBundle && (
                <div className="mt-2 p-3 rounded-2xl bg-stone-900 text-stone-200 font-mono text-[10px] space-y-2 overflow-x-auto">
                  <p className="text-stone-400"># Google Bubblewrap CLI commands:</p>
                  <pre>{twaBundle.cliCommand}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800/60 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            Always connected & loving forever
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-medium cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
