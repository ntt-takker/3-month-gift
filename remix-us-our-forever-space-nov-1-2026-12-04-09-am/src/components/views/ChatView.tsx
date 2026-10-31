import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Smile, Sparkles, Flame, Moon, Coffee } from 'lucide-react';
import { ChatMessage, CoupleProfile } from '../../types';
import { soundEngine } from '../../utils/audio';

interface ChatViewProps {
  messages: ChatMessage[];
  profile: CoupleProfile;
  onSendMessage: (text: string, isSticker?: boolean) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
}

const QUICK_STICKERS = [
  { label: 'Thinking of you', icon: '💭' },
  { label: 'Big warm hug', icon: '🫂' },
  { label: 'Sweet kiss', icon: '💋' },
  { label: 'Miss you so much', icon: '🥺' },
  { label: 'Forever yours', icon: '💖' },
  { label: 'Can\'t wait for tonight', icon: '🍷' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  profile,
  onSendMessage,
  onReactMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Defensively ensure message IDs are strictly unique to prevent React duplicate key warnings
  const uniqueMessages = React.useMemo(() => {
    if (!Array.isArray(messages)) return [];
    const seen = new Set<string>();
    const result: ChatMessage[] = [];
    for (const msg of messages) {
      if (msg && msg.id && !seen.has(msg.id)) {
        seen.add(msg.id);
        result.push(msg);
      }
    }
    return result;
  }, [messages]);

  const currentPartner = profile[profile.currentViewer];
  const otherPartnerId = profile.currentViewer === 'partner1' ? 'partner2' : 'partner1';
  const otherPartner = profile[otherPartnerId];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundEngine.playMessageSent();
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleStickerClick = (stickerText: string) => {
    soundEngine.playMessageSent();
    onSendMessage(stickerText, true);
    setShowStickers(false);
  };

  const handleReaction = (msgId: string, emoji: string) => {
    soundEngine.playBubblePop();
    onReactMessage(msgId, emoji);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Chat Header */}
      <div className="glass-panel p-4 rounded-3xl mb-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-3xl filter drop-shadow-sm">{otherPartner.avatar}</span>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              Chatting with {otherPartner.name}
              <span className="text-xs font-sans text-rose-500 font-normal">
                ({otherPartner.nickname})
              </span>
            </h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Connected · 24/7 Live Sync Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playKissSound();
              onSendMessage(`💋 Sent a sweet kiss to you!`, true);
            }}
            className="p-2.5 rounded-2xl glass-card-subtle text-rose-500 hover:text-rose-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Send Quick Kiss"
          >
            💋
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playHugSound();
              onSendMessage(`🫂 Sent a tight warm hug!`, true);
            }}
            className="p-2.5 rounded-2xl glass-card-subtle text-rose-500 hover:text-rose-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Send Warm Hug"
          >
            🫂
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 glass-panel rounded-3xl mb-3">
        {uniqueMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 dark:text-stone-500">
            <Heart className="w-12 h-12 text-rose-400/40 mb-2 animate-bounce" />
            <p className="text-sm font-serif italic text-stone-600 dark:text-stone-300">
              Our private chat sanctuary is ready.
            </p>
            <p className="text-xs mt-1">Send a whisper, sticker, or cute love note!</p>
          </div>
        ) : (
          uniqueMessages.map((msg, index) => {
            const isMe = msg.from === profile.currentViewer;
            const senderProfile = profile[msg.from] || currentPartner;

            return (
              <div
                key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-fade-in`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                  {!isMe && (
                    <span className="text-xl mb-1 select-none">{senderProfile.avatar}</span>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={`relative px-4 py-2.5 rounded-3xl text-sm leading-relaxed transition-all ${
                        isMe
                          ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/15 rounded-br-xs'
                          : 'glass-card text-stone-800 dark:text-stone-100 rounded-bl-xs'
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.text}</p>

                      {msg.reaction && (
                        <div
                          className={`absolute -bottom-2 ${
                            isMe ? 'left-2' : 'right-2'
                          } px-1.5 py-0.5 rounded-full glass-panel text-xs shadow-xs border border-white/40 dark:border-white/10`}
                        >
                          {msg.reaction}
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-stone-400 dark:text-stone-500 ${
                        isMe ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {/* Quick reaction trigger */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                        {['💖', '💋', '🥰'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isMe && (
                    <span className="text-xl mb-1 select-none">{currentPartner.avatar}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Stickers Drawer */}
      {showStickers && (
        <div className="glass-panel p-3 rounded-2xl mb-2 flex flex-wrap gap-2 animate-fade-in border border-rose-500/20">
          {QUICK_STICKERS.map((stk) => (
            <button
              key={stk.label}
              type="button"
              onClick={() => handleStickerClick(`${stk.icon} ${stk.label}`)}
              className="px-3 py-1.5 rounded-xl glass-card-subtle text-xs text-stone-700 dark:text-stone-200 hover:text-rose-500 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{stk.icon}</span>
              <span>{stk.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSend} className="glass-panel p-2 sm:p-3 rounded-3xl flex items-center gap-2 shadow-sm">
        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            setShowStickers(!showStickers);
          }}
          className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
            showStickers
              ? 'bg-rose-500 text-white'
              : 'glass-card-subtle text-stone-500 dark:text-stone-400 hover:text-rose-500 hover:scale-105 active:scale-95'
          }`}
          title="Stickers & Love Whispers"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Whisper something to ${otherPartner.name}...`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            inputText.trim()
              ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:scale-105 active:scale-95'
              : 'opacity-40 text-stone-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
