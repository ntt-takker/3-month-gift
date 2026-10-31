import React, { useState } from 'react';
import { Download, Smartphone, X, Heart, Check, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../utils/audio';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  const handleInstallClick = async () => {
    soundEngine.playBubblePop();
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        soundEngine.playSuccess();
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (isInstalled) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3000);
    } else {
      // General instructions fallback
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title={isInstalled ? 'App is installed on your device' : 'Install couple app to phone home screen'}
        className={`group flex items-center justify-center gap-2 rounded-2xl transition-all cursor-pointer font-medium ${
          compact
            ? 'p-2 text-xs text-rose-600 dark:text-rose-400 glass-card-subtle hover:scale-105 active:scale-95'
            : 'px-4 py-2 text-xs sm:text-sm text-stone-800 dark:text-stone-100 bg-linear-to-r from-rose-500/20 to-pink-500/20 hover:from-rose-500/30 hover:to-pink-500/30 border border-rose-500/30 dark:border-rose-400/30 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95'
        }`}
      >
        {isInstalled ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            {!compact && <span>Installed on Device</span>}
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-rose-500 group-hover:animate-bounce" />
            <span>{!compact ? 'Install App on Phone' : 'Install'}</span>
          </>
        )}
      </button>

      {installedNotice && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-500/30">
          <Check className="w-5 h-5 text-emerald-500" />
          <p className="text-xs text-stone-700 dark:text-stone-200">
            Us is already installed on this device home screen!
          </p>
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 glass-panel border border-white/40 dark:border-white/10 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setShowIOSGuide(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full glass-card-subtle text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Install "Us" Forever <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 mb-4 leading-relaxed">
              Add our couple sanctuary to your iPhone or Android home screen for instant full-screen access, cute sound effects, and 24/7 sync.
            </p>

            <div className="space-y-3 p-3 rounded-2xl glass-card-subtle text-xs text-stone-700 dark:text-stone-200 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>
                  Tap the <strong className="text-rose-600 dark:text-rose-400">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5" /> in Safari or your mobile browser.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Scroll down and tap <strong className="text-rose-600 dark:text-rose-400">“Add to Home Screen”</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Tap <strong className="text-rose-600 dark:text-rose-400">Add</strong> in top right. Enjoy our private couple app!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setShowIOSGuide(false);
              }}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md hover:shadow-rose-500/25 active:scale-98 cursor-pointer"
            >
              Got it, let's keep loving! 💕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
