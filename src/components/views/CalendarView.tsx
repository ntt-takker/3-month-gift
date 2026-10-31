import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Clock,
  Sparkles,
  CheckCircle,
  Circle,
  Gift,
  Smartphone,
  X,
} from 'lucide-react';
import { CoupleProfile, Milestone, ToDoItem } from '../../types';
import { soundEngine } from '../../utils/audio';

interface CalendarViewProps {
  profile: CoupleProfile;
  milestones: Milestone[];
  todos: ToDoItem[];
  onAddTodo: (todo: Omit<ToDoItem, 'id' | 'addedAt' | 'completed'>) => void;
  onToggleTodo: (id: string, note?: string) => void;
  onOpenWidgetStudio?: () => void;
}

export default function CalendarView({
  profile,
  milestones,
  todos,
  onAddTodo,
  onToggleTodo,
  onOpenWidgetStudio,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'dates' | 'travel' | 'dreams'>('dates');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().slice(0, 10));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    soundEngine.playTap();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    soundEngine.playTap();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month data
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTodo({
      title: newTitle.trim(),
      category: newCategory,
      assignedTo: 'both',
      dueDate: newDueDate,
    });
    soundEngine.playSuccess();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fda4af'],
    });
    setNewTitle('');
    setIsAddModalOpen(false);
  };

  // Filter events for selected date
  const selectedDayMilestones = milestones.filter((m) => m.date === selectedDate);
  const selectedDayTodos = todos.filter((t) => t.dueDate === selectedDate);

  // Compute countdown to next anniversary
  const anniversaryDateObj = new Date(profile.anniversaryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Next monthly anniversary
  const nextMonthAnniversary = new Date(today.getFullYear(), today.getMonth(), anniversaryDateObj.getDate());
  if (nextMonthAnniversary < today) {
    nextMonthAnniversary.setMonth(nextMonthAnniversary.getMonth() + 1);
  }
  const daysUntilNextMonthAnniversary = Math.ceil(
    (nextMonthAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Countdown Card */}
      <div className="glass-card p-6 rounded-3xl relative overflow-hidden border border-rose-300/30 dark:border-rose-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Special Countdown
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {daysUntilNextMonthAnniversary === 0
                ? "🎉 Today is Our Monthly Anniversary!"
                : `${daysUntilNextMonthAnniversary} Days Until Our Next Monthly Love Celebration`}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Anniversary Date: {profile.anniversaryDate} • Celebrating {profile.partner1.nickname} & {profile.partner2.nickname}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenWidgetStudio && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playBubblePop();
                  onOpenWidgetStudio();
                }}
                className="px-4 py-2.5 rounded-2xl glass-card hover:bg-white/80 dark:hover:bg-stone-800 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Smartphone className="w-4 h-4" /> Phone Widgets
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundEngine.playBubblePop();
                setNewDueDate(selectedDate);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Date Plan
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid & Schedule Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Box */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-3xl">
          {/* Header controls */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-500" />
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl glass-card-subtle text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl glass-card-subtle text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-stone-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="h-16 sm:h-20 rounded-2xl opacity-20" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const hasMilestone = milestones.some((m) => m.date === dateStr);
              const dayTodos = todos.filter((t) => t.dueDate === dateStr);
              const hasTodo = dayTodos.length > 0;
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    setSelectedDate(dateStr);
                  }}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.03] z-10'
                      : isToday
                      ? 'bg-rose-500/10 border-2 border-rose-500/40 text-stone-900 dark:text-stone-100'
                      : 'glass-card-subtle hover:bg-white/70 dark:hover:bg-stone-800/70 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <span className="text-xs font-semibold">{dayNum}</span>

                  <div className="flex items-center gap-1 flex-wrap">
                    {hasMilestone && (
                      <span
                        className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`}
                        title="Milestone"
                      />
                    )}
                    {hasTodo && (
                      <span
                        className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-400'}`}
                        title="Date Plan"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-stone-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">
                  Selected Date
                </span>
                <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                  {selectedDate}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playBubblePop();
                  setNewDueDate(selectedDate);
                  setIsAddModalOpen(true);
                }}
                className="p-2 rounded-xl glass-card text-rose-500 hover:scale-105 transition-all cursor-pointer"
                title="Add plan for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List for selected date */}
            <div className="mt-4 space-y-3">
              {selectedDayMilestones.length === 0 && selectedDayTodos.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  <Heart className="w-6 h-6 mx-auto mb-2 opacity-40 text-rose-400" />
                  <p>No special dates planned for this day yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playBubblePop();
                      setNewDueDate(selectedDate);
                      setIsAddModalOpen(true);
                    }}
                    className="text-rose-500 hover:underline mt-2 inline-block font-semibold"
                  >
                    + Plan a date or surprise
                  </button>
                </div>
              ) : (
                <>
                  {selectedDayMilestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5"
                    >
                      <span className="text-xl">{m.icon || '💖'}</span>
                      <div>
                        <p className="font-semibold text-xs text-rose-700 dark:text-rose-300">
                          {m.title}
                        </p>
                        {m.note && (
                          <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                            {m.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedDayTodos.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl glass-card-subtle flex items-start justify-between gap-2 border transition-all ${
                        t.completed
                          ? 'border-emerald-500/20 opacity-60'
                          : 'border-white/40 dark:border-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playSuccess();
                            onToggleTodo(t.id);
                          }}
                          className="mt-0.5 text-rose-500 hover:scale-110 transition-all cursor-pointer"
                        >
                          {t.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-stone-400" />
                          )}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              t.completed ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-100'
                            }`}
                          >
                            {t.title}
                          </p>
                          {t.completedNote && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic mt-0.5">
                              “{t.completedNote}”
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/50 dark:border-stone-800">
            <p className="text-[11px] text-stone-400 text-center">
              All dates & countdowns automatically sync across both your phones 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
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
              Plan a Couple Date or Activity
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Synced directly to your shared bucket list and calendar.
            </p>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  What are we doing together?
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Candlelight dinner, amusement park, museum date..."
                  className="w-full px-3.5 py-2.5 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl glass-card text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="dates">Cozy Date</option>
                    <option value="travel">Travel & Trip</option>
                    <option value="dreams">Future Dream</option>
                  </select>
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
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
