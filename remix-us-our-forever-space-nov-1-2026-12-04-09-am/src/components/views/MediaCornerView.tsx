import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Film,
  Music,
  BookOpen,
  MapPin,
  ExternalLink,
  Plus,
  Star,
  Sparkles,
  Calendar,
  X,
  CheckCircle,
  Disc,
  Radio,
  Edit3,
  Heart,
  Volume2,
} from 'lucide-react';
import { MediaRecommendation, CoupleProfile, SharedSpotifyPlaylist } from '../../types';
import { soundEngine } from '../../utils/audio';
import { formatSpotifyEmbedUrl } from '../../utils/storage';

interface MediaCornerViewProps {
  recommendations: MediaRecommendation[];
  profile: CoupleProfile;
  playlist: SharedSpotifyPlaylist;
  onAddRecommendation: (rec: Omit<MediaRecommendation, 'id' | 'suggestedAt'>) => void;
  onUpdateStatus: (id: string, status: MediaRecommendation['status'], rating?: number, review?: string) => void;
  onUpdatePlaylist: (playlist: SharedSpotifyPlaylist) => void;
}

export default function MediaCornerView({
  recommendations,
  profile,
  playlist,
  onAddRecommendation,
  onUpdateStatus,
  onUpdatePlaylist,
}: MediaCornerViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'song' | 'movie' | 'book' | 'spot'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Playlist edit state
  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [editUrl, setEditUrl] = useState(playlist.url);
  const [editTitle, setEditTitle] = useState(playlist.title);
  const [editDesc, setEditDesc] = useState(playlist.description);

  // Review modal state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [sharedReview, setSharedReview] = useState('');

  // Add form state
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [category, setCategory] = useState<MediaRecommendation['category']>('song');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');

  const activeViewer = profile.currentViewer;

  const handleSavePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUrl.trim()) return;

    soundEngine.playSuccess();
    const embedUrl = formatSpotifyEmbedUrl(editUrl.trim());

    onUpdatePlaylist({
      url: editUrl.trim(),
      embedUrl,
      title: editTitle.trim() || 'Our Shared Spotify Playlist 💕',
      description: editDesc.trim() || 'Songs that connect us no matter the distance.',
      updatedBy: activeViewer,
      updatedAt: Date.now(),
    });

    setIsEditingPlaylist(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !note.trim()) return;

    onAddRecommendation({
      title: title.trim(),
      creator: creator.trim() || undefined,
      category,
      note: note.trim(),
      url: url.trim() || undefined,
      suggestedBy: activeViewer,
      status: 'to_experience',
    });

    soundEngine.playHeartSound();
    setTitle('');
    setCreator('');
    setNote('');
    setUrl('');
    setIsAddModalOpen(false);
  };

  const handleSaveReview = () => {
    if (reviewingId) {
      soundEngine.playUnlockSound();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#38bdf8'],
      });

      onUpdateStatus(reviewingId, 'completed', rating, sharedReview.trim() || undefined);
      setReviewingId(null);
      setRating(5);
      setSharedReview('');
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    return true;
  });

  const categoryIcons: Record<MediaRecommendation['category'], { icon: typeof Music; label: string }> = {
    song: { icon: Music, label: 'Song' },
    movie: { icon: Film, label: 'Movie' },
    book: { icon: BookOpen, label: 'Book' },
    spot: { icon: MapPin, label: 'Date Spot' },
  };

  const playlistUpdater = profile[playlist.updatedBy];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-rose-500 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Recommendations & Music
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Songs, Movies & Playlists For Us
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Our shared Spotify soundtrack, recommendations, and memory watchlist
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" /> Suggest Something New
        </button>
      </div>

      {/* Shared Spotify Playlist Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center shrink-0 shadow-xs">
              <Disc className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Spotify Shared Embed
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Updated by {playlistUpdater.name} ({playlistUpdater.nickname})
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                {playlist.title}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {playlist.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              setEditUrl(playlist.url);
              setEditTitle(playlist.title);
              setEditDesc(playlist.description);
              setIsEditingPlaylist(true);
            }}
            className="px-3.5 py-2 rounded-2xl glass-card-subtle hover:text-[#1DB954] text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" /> Change Playlist Link
          </button>
        </div>

        {/* Embedded Spotify Iframe Player */}
        <div className="w-full rounded-2xl overflow-hidden bg-black/40 shadow-inner">
          <iframe
            title="Shared Couple Spotify Playlist"
            src={playlist.embedUrl}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl border-0 w-full"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'song', 'movie', 'book', 'spot'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              soundEngine.playBubblePop();
              setCategoryFilter(cat);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              categoryFilter === cat
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-102'
                : 'glass-card-subtle text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:scale-105'
            }`}
          >
            {cat === 'all' ? 'All Recommendations' : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredRecs.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl p-6">
          <Music className="w-12 h-12 text-stone-400 dark:text-stone-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-serif font-bold text-stone-700 dark:text-stone-300">
            No recommendations in this category yet
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Share a song that made you think of them, a movie for movie night, or a cozy cafe to visit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const CatIcon = categoryIcons[rec.category].icon;
            const suggester = profile[rec.suggestedBy];
            const isCompleted = rec.status === 'completed';

            return (
              <div
                key={rec.id}
                className="glass-card p-5 rounded-3xl flex flex-col justify-between transition-all hover:scale-[1.01]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl glass-card-subtle text-rose-500">
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
                        {categoryIcons[rec.category].label}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isCompleted ? 'Experienced Together ✨' : 'To Experience'}
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                    {rec.title}
                  </h3>
                  {rec.creator && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
                      by {rec.creator}
                    </p>
                  )}

                  <p className="text-xs text-stone-700 dark:text-stone-300 italic mb-4 leading-relaxed glass-card-subtle p-3 rounded-2xl">
                    “{rec.note}”
                  </p>
                </div>

                <div className="pt-3 border-t border-white/20 dark:border-white/5 space-y-3">
                  {/* Reviews & Ratings */}
                  {isCompleted && (
                    <div className="p-3 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          Couple Rating
                        </span>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= (rec.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300 dark:text-stone-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {rec.sharedReview && (
                        <p className="text-stone-600 dark:text-stone-300 text-[11px] italic">
                          “{rec.sharedReview}”
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <span>{suggester.avatar}</span>
                      <span>By {suggester.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:scale-105 active:scale-95 transition-all"
                          title="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playBubblePop();
                            setReviewingId(rec.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Experienced
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Playlist Change Modal */}
      {isEditingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsEditingPlaylist(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#1DB954]/20 text-[#1DB954]">
                <Disc className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Update Shared Spotify Playlist
                </h3>
                <p className="text-xs text-stone-500">
                  Embed any Spotify playlist, album, or track to play together.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Spotify Link (Playlist, Album or Song)
                </label>
                <input
                  type="text"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Copy link from Spotify app: Share → Copy Link to Playlist.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Our 3-Month Love Frequencies 💕"
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Romantic Note or Meaning
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="What makes this playlist special for us..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPlaylist(false)}
                  className="px-4 py-2 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  Save & Embed Player ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suggest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-7 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setIsAddModalOpen(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-full glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-500">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Suggest Media or Date Spot
                </h3>
                <p className="text-xs text-stone-500">
                  Add something you want to listen, watch, or do together.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['song', 'movie', 'book', 'spot'] as const).map((cat) => {
                  const CatIcon = categoryIcons[cat].icon;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        soundEngine.playTap();
                        setCategory(cat);
                      }}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        category === cat
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold scale-102'
                          : 'glass-card-subtle text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      <CatIcon className="w-4 h-4" />
                      <span className="text-[11px]">{categoryIcons[cat].label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Yellow, About Time, The Little Prince, Cozy Rooftop..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Artist / Director / Author / Location (Optional)
                </label>
                <input
                  type="text"
                  value={creator}
                  onChange={(e) => setCreator(e.target.value)}
                  placeholder="e.g. Coldplay, Richard Curtis..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Why you want to share this with them
                </label>
                <textarea
                  required
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reminded me of your laugh, let's watch this on Friday night..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Link (Spotify, YouTube, IMDb, Maps)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  Add Suggestion ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setReviewingId(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-full glass-card-subtle text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-1">
              Mark as Experienced Together
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Rate how much you two enjoyed this experience and write a joint review.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        soundEngine.playTap();
                        setRating(star);
                      }}
                      className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Our Shared Memory / Review
                </label>
                <textarea
                  rows={3}
                  value={sharedReview}
                  onChange={(e) => setSharedReview(e.target.value)}
                  placeholder="We both cried at the ending... / The tiramisu was incredible!"
                  className="w-full px-4 py-2.5 rounded-2xl glass-card text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingId(null)}
                  className="px-4 py-2 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  Save to Memories ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
