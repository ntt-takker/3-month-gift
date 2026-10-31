import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Heart,
  CheckCircle,
  Circle,
  Calendar,
  Sparkles,
  Trash2,
  X,
  MessageSquareHeart,
  Plane,
  Home,
  Coffee,
} from 'lucide-react';
import { ToDoItem, CoupleProfile, PartnerId } from '../../types';
import { soundEngine } from '../../utils/audio';

interface ToDoViewProps {
  todos: ToDoItem[];
  profile: CoupleProfile;
  onAddTodo: (newTodo: Omit<ToDoItem, 'id' | 'addedAt' | 'completed'>) => void;
  onToggleTodo: (id: string, completedNote?: string) => void;
  onDeleteTodo: (id: string) => void;
}

export default function ToDoView({
  todos,
  profile,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: ToDoViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('dates');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<PartnerId | 'both'>('both');

  // Completion note prompt
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  const handleToggle = (item: ToDoItem) => {
    if (!item.completed) {
      // Opening note modal to write memory of how it went
      setCompletingId(item.id);
      setCompletionNote('');
    } else {
      // Un-complete
      soundEngine.playTap();
      onToggleTodo(item.id);
    }
  };

  const handleConfirmCompletion = () => {
    if (!completingId) return;
    soundEngine.playSuccess();
    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af', '#fb7185'],
    });
    onToggleTodo(completingId, completionNote.trim() || undefined);
    setCompletingId(null);
    setCompletionNote('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTodo({
      title: title.trim(),
      category,
      dueDate: dueDate || undefined,
      assignedTo,
      addedBy: profile.currentViewer,
    });
    soundEngine.playSuccess();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
    });
    setTitle('');
    setDueDate('');
    setIsAddModalOpen(false);
  };

  // Filtered items
  const filtered = todos.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (statusFilter === 'pending' && item.completed) return false;
    if (statusFilter === 'completed' && !item.completed) return false;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-rose-300/30 dark:border-rose-900/30">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Shared Bucket List
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Adventures & Memories To Make Together
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {completedCount} of {todos.length} dreams accomplished ({progressPercent}%)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playBubblePop();
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Bucket Item
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200/60 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
        <div
          className="bg-rose-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'dates', label: 'Dates & Outings' },
            { id: 'travel', label: 'Travel & Trips' },
            { id: 'dreams', label: 'Future Dreams' },
            { id: 'everyday', label: 'Everyday Little Things' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setFilterCategory(cat.id);
              }}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'glass-card-subtle text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 glass-card p-1 rounded-2xl">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setStatusFilter(status);
              }}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {status === 'all' ? 'All' : status === 'pending' ? 'To Do' : 'Done ✨'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl p-6">
            <CheckSquare className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-50" />
            <h4 className="font-serif font-bold text-base text-stone-700 dark:text-stone-300">
              No bucket list items in this view
            </h4>
            <p className="text-xs text-stone-500 mt-1">
              Add your first couple dream or date idea!
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl glass-card flex items-start justify-between gap-3 transition-all ${
                  item.completed
                    ? 'border-emerald-500/25 bg-emerald-500/5 opacity-80'
                    : 'hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(item)}
                    className="mt-0.5 text-rose-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-400 hover:text-rose-500" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        item.completed
                          ? 'line-through text-stone-400 dark:text-stone-500'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {item.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-stone-500 dark:text-stone-400">
                      {item.category && (
                        <span className="capitalize px-2 py-0.5 rounded-full bg-stone-200/50 dark:bg-stone-800 text-[10px] font-medium">
                          {item.category}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-500" /> {item.dueDate}
                        </span>
                      )}
                    </div>

                    {item.completedNote && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 italic flex items-start gap-2">
                        <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>“{item.completedNote}”</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playBubblePop();
                    onDeleteTodo(item.id);
                  }}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-500 glass-card-subtle transition-colors cursor-pointer shrink-0"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl relative">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mb-1">
              Add Bucket List Wish
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              A dream or adventure to experience together.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  What do you want to do together?
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Kiss under the Eiffel tower, watch sunrise on the beach..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="dates">Dates & Outings</option>
                    <option value="travel">Travel & Trips</option>
                    <option value="dreams">Future Dreams</option>
                    <option value="everyday">Everyday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-500/25 cursor-pointer"
                >
                  Add to Bucket List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion Memory Prompt Modal */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl relative">
            <button
              type="button"
              onClick={() => setCompletingId(null)}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-2xl">🎉</span>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 mt-2 mb-1">
              You Completed a Bucket List Dream!
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Add a sweet note or memory about how it went (optional).
            </p>

            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="e.g. Best day of our lives! We laughed so hard when..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  onToggleTodo(completingId);
                  setCompletingId(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                Skip Note
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Mark Accomplished ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
