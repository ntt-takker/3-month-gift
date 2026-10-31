import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Square,
  Plus,
  Sparkles,
  Calendar,
  User,
  X,
  Heart,
  Tag,
} from 'lucide-react';
import { ToDoItem, CoupleProfile } from '../../types';
import { soundEngine } from '../../utils/audio';

interface ToDoViewProps {
  todos: ToDoItem[];
  profile: CoupleProfile;
  onAddTodo: (todo: Omit<ToDoItem, 'id' | 'addedAt' | 'completed'>) => void;
  onToggleTodo: (id: string, note?: string) => void;
  onDeleteTodo: (id: string) => void;
}

export default function ToDoView({
  todos,
  profile,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}: ToDoViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New todo form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ToDoItem['category']>('date');

  // Complete modal
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeNote, setCompleteNote] = useState('');

  const activeViewer = profile.currentViewer;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTodo({
      title: title.trim(),
      category,
      addedBy: activeViewer,
    });

    soundEngine.playHeartSound();
    setTitle('');
    setIsAddModalOpen(false);
  };

  const handleCheckboxClick = (todo: ToDoItem) => {
    if (todo.completed) {
      // Uncheck
      onToggleTodo(todo.id);
    } else {
      // Prompt for a completed memory note
      setCompletingId(todo.id);
      setCompleteNote('');
    }
  };

  const handleConfirmCompletion = () => {
    if (completingId) {
      soundEngine.playUnlockSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#f43f5e', '#fbbf24'],
      });
      onToggleTodo(completingId, completeNote.trim() || undefined);
      setCompletingId(null);
      setCompleteNote('');
    }
  };

  // Filtered todos
  const filteredTodos = todos.filter((item) => {
    if (filter === 'active' && item.completed) return false;
    if (filter === 'completed' && !item.completed) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  const categoryLabels: Record<ToDoItem['category'], { label: string; icon: string }> = {
    date: { label: 'Date Idea', icon: '🍷' },
    travel: { label: 'Travel & Trips', icon: '✈️' },
    cute: { label: 'Cute Moment', icon: '🧸' },
    movie: { label: 'Movie & Cozy', icon: '🍿' },
    food: { label: 'Food & Cooking', icon: '🍝' },
  };

  const formatTimestamp = (timestamp: number) => {
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
          <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Couple Bucket List
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            What We Want To Do Next
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Dates, adventures, and cute ideas logged by both of us
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Date or To-Do
        </button>
      </div>

      {/* Progress & Quick Stats Card (Apple Glass Styling) */}
      <div className="p-6 rounded-3xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
            Our Date Progress <Heart className="w-3 h-3 text-rose-500 fill-current" />
          </div>
          <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-0.5">
            {completedCount} of {todos.length} Adventures Completed
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center glass-card-subtle p-1 rounded-2xl text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Up Next ({todos.length - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Todo Items List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-3xl glass-card">
            <CheckSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400">No items found in this view.</p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const author =
              todo.addedBy === 'partner1' ? profile.partner1 : profile.partner2;

            return (
              <div
                key={todo.id}
                className={`p-4.5 rounded-3xl transition-all flex items-start gap-3.5 ${
                  todo.completed
                    ? 'glass-card-subtle opacity-75'
                    : 'glass-card hover:scale-[1.01]'
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={() => handleCheckboxClick(todo)}
                  className={`mt-0.5 shrink-0 transition-transform active:scale-90 cursor-pointer ${
                    todo.completed ? 'text-emerald-500' : 'text-stone-400 hover:text-rose-500'
                  }`}
                  title={todo.completed ? 'Mark as incomplete' : 'Mark as done together!'}
                >
                  {todo.completed ? (
                    <CheckSquare className="w-5 h-5 fill-emerald-500/20" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-sm font-medium leading-snug flex items-center gap-1.5 ${
                        todo.completed
                          ? 'line-through text-stone-500 dark:text-stone-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {todo.title}
                      {!todo.completed && <Heart className="w-2.5 h-2.5 text-rose-400 fill-current opacity-60 inline" />}
                    </span>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 shrink-0 border border-white/40 dark:border-white/5">
                      {categoryLabels[todo.category]?.icon} {categoryLabels[todo.category]?.label}
                    </span>
                  </div>

                  {/* Completion Note */}
                  {todo.completed && todo.completedNote && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-300/40 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 italic">
                      &ldquo;{todo.completedNote}&rdquo;
                    </div>
                  )}

                  {/* Attribution & Timestamp Metadata (Crucial Requirement!) */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-stone-600 pt-1.5 border-t border-stone-100 dark:border-stone-800/60">
                    <span className="flex items-center gap-1">
                      <span>{author.avatar}</span>
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Added by {author.name} (&ldquo;{author.nickname}&rdquo;)
                      </span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatTimestamp(todo.addedAt)}
                    </span>
                    {todo.completed && todo.completedAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Done {formatTimestamp(todo.completedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeleteTodo(todo.id)}
                  className="text-stone-300 hover:text-rose-500 p-1 rounded-lg transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add New Todo */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  Add Date or Wishlist Idea
                </h3>
                <p className="text-xs text-stone-600">
                  Adding as {profile.currentViewer === 'partner1' ? profile.partner1.name : profile.partner2.name}
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
                  What would you like for us to do?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Sunset pottery class together, then grabbing tacos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(categoryLabels) as ToDoItem['category'][]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                        category === cat
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600'
                      }`}
                    >
                      <span>{categoryLabels[cat].icon}</span>
                      <span>{categoryLabels[cat].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
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
                  Add to Wishlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Date with Note */}
      {completingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#FAF8F5] dark:bg-[#1A181C] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                You Did It Together!
              </h3>
              <p className="text-xs text-stone-600">
                Attach a cute note or memory from this date (optional)
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="e.g. Best date night ever! The dessert was delicious and you looked amazing."
              value={completeNote}
              onChange={(e) => setCompleteNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingId(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
              >
                Mark as Completed! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
