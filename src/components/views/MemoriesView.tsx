import { useState } from 'react';
import {
  Calendar,
  Camera,
  Plus,
  Heart,
  MapPin,
  Clock,
  Sparkles,
  Maximize2,
  X,
  Upload,
  Trash2,
} from 'lucide-react';
import { Milestone, PhotoMemory, CoupleProfile } from '../../types';
import { soundEngine } from '../../utils/audio';

interface MemoriesViewProps {
  milestones: Milestone[];
  photos: PhotoMemory[];
  profile: CoupleProfile;
  onAddPhoto: (photo: Omit<PhotoMemory, 'id' | 'addedAt'>) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onUpdateMilestone: (milestone: Milestone) => void;
  onTogglePhotoFavorite: (id: string) => void;
  onDeletePhoto: (id: string) => void;
  onDeleteMilestone: (id: string) => void;
}

export default function MemoriesView({
  milestones,
  photos,
  profile,
  onAddPhoto,
  onAddMilestone,
  onUpdateMilestone,
  onTogglePhotoFavorite,
  onDeletePhoto,
  onDeleteMilestone,
}: MemoriesViewProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'album'>('timeline');

  // Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // New photo form state
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoLocation, setPhotoLocation] = useState('');

  // New milestone form state
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(new Date().toISOString().split('T')[0]);
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneNote, setMilestoneNote] = useState('');

  const activeViewer = profile.currentViewer;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    onAddPhoto({
      url: photoUrl,
      caption: photoCaption.trim() || 'A sweet memory together',
      date: photoDate,
      location: photoLocation.trim() || undefined,
      addedBy: activeViewer,
      isFavorite: false,
    });

    soundEngine.playHeartSound();
    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoLocation('');
    setIsPhotoModalOpen(false);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDate) return;

    onAddMilestone({
      title: milestoneTitle.trim(),
      date: milestoneDate,
      type: 'custom',
      description: milestoneDesc.trim(),
      note: milestoneNote.trim() || undefined,
      badge: 'Custom Moment',
    });

    soundEngine.playUnlockSound();
    setMilestoneTitle('');
    setMilestoneDesc('');
    setMilestoneNote('');
    setIsMilestoneModalOpen(false);
  };

  const handleSaveMilestoneEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;

    onUpdateMilestone(editingMilestone);
    soundEngine.playHeartSound();
    setEditingMilestone(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Preserved Forever
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Our Memories & Moments
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Auto-logged milestone timeline and our shared polaroid album
          </p>
        </div>

        {/* View Switcher Tabs & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Milestone Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('album')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'album'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Shared Photo Album ({photos.length})
            </button>
          </div>

          {activeTab === 'album' ? (
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Photo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsMilestoneModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Milestone
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: Milestone Timeline */}
      {activeTab === 'timeline' && (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200 dark:before:bg-rose-950/60">
          {milestones.map((milestone) => {
            const isToday = milestone.title.includes('Today');
            return (
              <div key={milestone.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isToday
                      ? 'bg-rose-600 border-white text-white shadow-md'
                      : 'bg-white dark:bg-stone-900 border-rose-300 dark:border-rose-800 text-rose-500'
                  }`}
                >
                  <Heart className="w-2.5 h-2.5 fill-current" />
                </div>

                {/* Milestone Card (Apple Glass Styling) */}
                <div
                  className={`p-5 rounded-3xl transition-all ${
                    isToday
                      ? 'bg-rose-500/15 dark:bg-rose-500/20 border border-rose-300/60 dark:border-rose-500/40 shadow-lg'
                      : 'glass-card hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-current" /> {milestone.badge || 'Milestone'}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {milestone.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMilestone(milestone)}
                        className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                      >
                        {milestone.note ? 'Edit Note' : '+ Note'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playBubblePop();
                          onDeleteMilestone(milestone.id);
                        }}
                        className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete milestone from both apps"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    {milestone.title}
                    {isToday && <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {milestone.description}
                  </p>

                  {/* Attached Note / Reflection */}
                  {milestone.note && (
                    <div className="mt-3 p-3 rounded-2xl glass-card-subtle text-xs text-stone-700 dark:text-stone-200 italic border border-white/40 dark:border-white/5">
                      &ldquo;{milestone.note}&rdquo;
                    </div>
                  )}

                  {/* Attached Photo */}
                  {milestone.photoUrl && (
                    <div className="mt-3 overflow-hidden rounded-2xl max-w-sm border border-stone-200/50 dark:border-stone-800/60 shadow-xs">
                      <img
                        src={milestone.photoUrl}
                        alt={milestone.title}
                        className="w-full h-40 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Shared Polaroid Photo Album */}
      {activeTab === 'album' && (
        <div>
          {photos.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
              <Camera className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                No Photos Added Yet
              </h3>
              <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto mb-4">
                Both of you can add snapshots, polaroids, and favorite memories together.
              </p>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium cursor-pointer"
              >
                Add Our First Photo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => {
                const authorName =
                  photo.addedBy === 'partner1' ? profile.partner1.name : profile.partner2.name;
                const authorAvatar =
                  photo.addedBy === 'partner1' ? profile.partner1.avatar : profile.partner2.avatar;

                return (
                  <div
                    key={photo.id}
                    className="group glass-card rounded-3xl p-3.5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:scale-[1.02]"
                  >
                    {/* Polaroid Image Box */}
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedPhoto(photo)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="View Full Size"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playHeartSound();
                            onTogglePhotoFavorite(photo.id);
                          }}
                          className="p-2 rounded-2xl glass-card text-rose-500 shadow-sm transition-transform active:scale-125 cursor-pointer"
                          title={photo.isFavorite ? 'Unfavorite' : 'Mark as favorite'}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={photo.isFavorite ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playBubblePop();
                            onDeletePhoto(photo.id);
                          }}
                          className="p-2 rounded-2xl glass-card text-stone-400 hover:text-rose-500 shadow-sm transition-transform active:scale-125 cursor-pointer"
                          title="Delete photo from both apps"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Polaroid Bottom Notes */}
                    <div className="pt-3 px-1">
                      <p className="text-xs font-serif text-stone-800 dark:text-stone-200 leading-relaxed italic line-clamp-2">
                        &ldquo;{photo.caption}&rdquo;
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-stone-200/40 dark:border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {photo.date}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[130px]">
                          <span>{authorAvatar}</span> Added by {authorName}
                          <Heart className="w-2.5 h-2.5 text-rose-400 fill-current opacity-70" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Photo */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Add Photo Memory
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Photo (Upload or Image URL)
                </label>
                <div className="flex gap-2 mb-2">
                  <label className="flex-1 px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-50 flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>Upload from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  placeholder="Or paste an image URL..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {photoUrl && (
                <div className="h-32 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Sweet Caption / Story
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="What made this moment so special?"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunset Point"
                    value={photoLocation}
                    onChange={(e) => setPhotoLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!photoUrl}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Milestone */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Add Custom Milestone
              </h3>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Our First Weekend Getaway"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Road trip to the mountains cabin"
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Memory Note / Reflection (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What made this milestone unforgettable?"
                  value={milestoneNote}
                  onChange={(e) => setMilestoneNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium hover:opacity-90"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Milestone Note */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Edit {editingMilestone.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestoneEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Attached Memory Note
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a sweet memory or note for this milestone..."
                  value={editingMilestone.note || ''}
                  onChange={(e) =>
                    setEditingMilestone({
                      ...editingMilestone,
                      note: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingMilestone.photoUrl || ''}
                  onChange={(e) =>
                    setEditingMilestone({
                      ...editingMilestone,
                      photoUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBubblePop();
                    onDeleteMilestone(editingMilestone.id);
                    setEditingMilestone(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Memory
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMilestone(null)}
                    className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="max-h-[65vh] overflow-hidden rounded-2xl mb-4 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-h-[65vh] w-auto object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center space-y-2">
              <p className="font-serif text-sm sm:text-base text-stone-900 dark:text-stone-100 italic">
                &ldquo;{selectedPhoto.caption}&rdquo;
              </p>
              <div className="text-xs text-stone-600 flex items-center justify-center gap-3">
                <span>{selectedPhoto.date}</span>
                {selectedPhoto.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-500" /> {selectedPhoto.location}
                  </span>
                )}
              </div>
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBubblePop();
                    onDeletePhoto(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Photo Memory from Both Phones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
