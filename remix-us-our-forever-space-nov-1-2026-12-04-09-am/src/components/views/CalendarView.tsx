import { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Sparkles,
  Gift,
  CheckCircle2,
  Circle,
  Clock,
  Film,
  Utensils,
  Compass,
  Smile,
  X,
  Smartphone,
  CalendarHeart,
  PartyPopper,
  Share2,
} from 'lucide-react';
import { CoupleProfile, Milestone, ToDoItem, PartnerId } from '../../types';
import { soundEngine } from '../../utils/audio';

interface CalendarViewProps {
  profile: CoupleProfile;
  milestones: Milestone[];
  todos: ToDoItem[];
  onAddTodo: (todo: Omit<ToDoItem, 'id' | 'addedAt' | 'completed'>) => void;
  onToggleTodo: (id: string, note?: string) => void;
  onOpenWidgetStudio?: () => void;
}

export type EventFilter = 'all' | 'milestones' | 'dates' | 'birthdays';

export interface CalendarEvent {
  id: string;
  type: 'milestone' | 'birthday' | 'planned_date' | 'monthly_anniv';
  title: string;
  dateStr: string; // YYYY-MM-DD
  category?: ToDoItem['category'];
  addedBy?: PartnerId;
  completed?: boolean;
  avatar?: string;
  badge?: string;
  note?: string;
  originalTodoId?: string;
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
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const [isPlanDateModalOpen, setIsPlanDateModalOpen] = useState(false);

  // New planned date form state
  const [planTitle, setPlanTitle] = useState('');
  const [planCategory, setPlanCategory] = useState<ToDoItem['category']>('date');
  const [planDate, setPlanDate] = useState(selectedDateStr);

  const activePartner = profile[profile.currentViewer];
  const otherPartner = profile[profile.currentViewer === 'partner1' ? 'partner2' : 'partner1'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const handlePrevMonth = () => {
    soundEngine.playBubblePop();
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    soundEngine.playBubblePop();
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    soundEngine.playBubblePop();
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  };

  // Compile all overlay events across milestones, birthdays, planned dates, and monthly anniversaries
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    // 1. Explicit milestones
    milestones.forEach((m) => {
      events.push({
        id: `m-${m.id}`,
        type: 'milestone',
        title: m.title,
        dateStr: m.date,
        badge: m.badge || 'Milestone',
        note: m.description,
      });
    });

    // 2. Double partner birthdays
    if (profile.partner1.birthday) {
      const [, m, d] = profile.partner1.birthday.split('-');
      // Project into current year
      const p1DateThisYear = `${currentYear}-${m}-${d}`;
      events.push({
        id: `bday-p1-${currentYear}`,
        type: 'birthday',
        title: `${profile.partner1.nickname}’s Birthday 🎂`,
        dateStr: p1DateThisYear,
        avatar: profile.partner1.avatar,
        badge: 'Birthday ✨',
        note: `Celebrating ${profile.partner1.nickname}`,
      });
    }

    if (profile.partner2.birthday) {
      const [, m, d] = profile.partner2.birthday.split('-');
      const p2DateThisYear = `${currentYear}-${m}-${d}`;
      events.push({
        id: `bday-p2-${currentYear}`,
        type: 'birthday',
        title: `${profile.partner2.nickname}’s Birthday 🌸`,
        dateStr: p2DateThisYear,
        avatar: profile.partner2.avatar,
        badge: 'Birthday ✨',
        note: `Celebrating ${profile.partner2.nickname}`,
      });
    }

    // 3. Monthly couple anniversary (e.g. Day 31 of every month)
    if (profile.anniversaryDate) {
      const [, , dayPart] = profile.anniversaryDate.split('-');
      const targetDay = parseInt(dayPart, 10);
      // Generate for current month
      const daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      if (targetDay <= daysInThisMonth) {
        const annivDateThisMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
        // Avoid duplicate if an explicit milestone is already on this date
        if (!events.some((e) => e.dateStr === annivDateThisMonth && e.type === 'milestone')) {
          events.push({
            id: `anniv-month-${currentYear}-${currentMonth}`,
            type: 'monthly_anniv',
            title: `Our Monthly Day ${targetDay} Celebration 💕`,
            dateStr: annivDateThisMonth,
            badge: 'Monthly Us Day',
            note: 'Another month deeper in love together.',
          });
        }
      }
    }

    // 4. Planned dates & to-dos
    todos.forEach((t) => {
      let dateString = t.targetDate;
      if (!dateString && t.addedAt) {
        dateString = new Date(t.addedAt).toISOString().slice(0, 10);
      }
      if (dateString) {
        events.push({
          id: `todo-${t.id}`,
          type: 'planned_date',
          title: t.title,
          dateStr: dateString,
          category: t.category,
          addedBy: t.addedBy,
          completed: t.completed,
          originalTodoId: t.id,
        });
      }
    });

    return events;
  }, [milestones, todos, profile, currentYear, currentMonth]);

  // Filter events based on active category
  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return allEvents;
    if (activeFilter === 'milestones') return allEvents.filter((e) => e.type === 'milestone' || e.type === 'monthly_anniv');
    if (activeFilter === 'dates') return allEvents.filter((e) => e.type === 'planned_date');
    if (activeFilter === 'birthdays') return allEvents.filter((e) => e.type === 'birthday');
    return allEvents;
  }, [allEvents, activeFilter]);

  // Map events by dateStr for quick calendar lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    filteredEvents.forEach((ev) => {
      const list = map.get(ev.dateStr) || [];
      list.push(ev);
      map.set(ev.dateStr, list);
    });
    return map;
  }, [filteredEvents]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to fill standard 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Events on the currently selected day
  const selectedDayEvents = useMemo(() => {
    return allEvents.filter((e) => e.dateStr === selectedDateStr);
  }, [allEvents, selectedDateStr]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handleCellClick = (dateStr: string) => {
    soundEngine.playBubblePop();
    setSelectedDateStr(dateStr);
  };

  const handleCreatePlannedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;

    onAddTodo({
      title: planTitle.trim(),
      category: planCategory,
      addedBy: profile.currentViewer,
      targetDate: planDate,
    });

    soundEngine.playSuccess();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#d946ef'],
    });

    setPlanTitle('');
    setIsPlanDateModalOpen(false);
  };

  const getCategoryIcon = (cat?: ToDoItem['category']) => {
    switch (cat) {
      case 'movie': return <Film className="w-3.5 h-3.5 text-purple-500" />;
      case 'food': return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'travel': return <Compass className="w-3.5 h-3.5 text-blue-500" />;
      case 'cute': return <Smile className="w-3.5 h-3.5 text-pink-500" />;
      default: return <Heart className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 relative z-10 max-w-6xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-2">
            <CalendarHeart className="w-3.5 h-3.5" />
            <span>Shared Couple Calendar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            Our Love Calendar
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
            Milestones, planned dates & birthdays overlaid in one shared monthly sanctuary
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onOpenWidgetStudio && (
            <button
              type="button"
              onClick={onOpenWidgetStudio}
              className="px-3.5 py-2 rounded-xl glass-card hover:bg-rose-500/15 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-white/50"
              title="View mobile home screen shortcut widgets"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-500" />
              <span>Mobile Widgets</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setPlanDate(selectedDateStr);
              setIsPlanDateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Date</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Card & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid Section */}
        <div className="lg:col-span-8 glass-panel p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm space-y-4">
          {/* Month Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-white/40 dark:border-white/10">
            {/* Prev / Next / Today */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-stone-100 min-w-[150px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h2>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-stone-700 dark:text-stone-200 hover:text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1.5 rounded-xl glass-card-subtle text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
              >
                Today
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all' as const, label: 'All', icon: Sparkles },
                { id: 'milestones' as const, label: 'Milestones', icon: Heart },
                { id: 'dates' as const, label: 'Dates', icon: CalendarIcon },
                { id: 'birthdays' as const, label: 'Birthdays', icon: Gift },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playBubblePop();
                      setActiveFilter(f.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'glass-card-subtle text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-semibold text-stone-400 dark:text-stone-500 py-1 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell) => {
              const dayEvents = eventsByDate.get(cell.dateStr) || [];
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleCellClick(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[85px] p-1.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative group border ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500 dark:border-rose-400 ring-2 ring-rose-400/40 shadow-sm'
                      : cell.isCurrentMonth
                      ? 'glass-card border-white/50 dark:border-white/5 hover:border-rose-300 dark:hover:border-rose-700'
                      : 'bg-stone-100/40 dark:bg-stone-900/20 text-stone-400 dark:text-stone-600 border-transparent opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        cell.isToday
                          ? 'bg-rose-500 text-white font-bold shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-stone-800 dark:text-stone-200'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-rose-500 font-bold sm:hidden">
                        • {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview in cell (desktop) */}
                  <div className="space-y-1 mt-1 hidden sm:block overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const isMilestone = ev.type === 'milestone' || ev.type === 'monthly_anniv';
                      const isBday = ev.type === 'birthday';
                      return (
                        <div
                          key={ev.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 ${
                            isMilestone
                              ? 'bg-rose-500 text-white'
                              : isBday
                              ? 'bg-amber-400/25 text-amber-800 dark:text-amber-200 border border-amber-300/40'
                              : 'bg-stone-200/60 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300'
                          }`}
                          title={ev.title}
                        >
                          {isMilestone && <Heart className="w-2.5 h-2.5 fill-current shrink-0" />}
                          {isBday && <Gift className="w-2.5 h-2.5 shrink-0" />}
                          {!isMilestone && !isBday && getCategoryIcon(ev.category)}
                          <span className="truncate">{ev.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-stone-400 px-1 font-semibold">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Dot markers on mobile */}
                  <div className="flex sm:hidden items-center justify-center gap-0.5 pt-1">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          ev.type === 'milestone' ? 'bg-rose-500' : ev.type === 'birthday' ? 'bg-amber-400' : 'bg-pink-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Detail Pane (Apple Glass Card) */}
        <div className="lg:col-span-4 glass-panel p-5 sm:p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/40 dark:border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">
                Selected Day Agenda
              </span>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                {new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setPlanDate(selectedDateStr);
                setIsPlanDateModalOpen(true);
              }}
              className="p-2 rounded-xl glass-card text-rose-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Add plan for this date"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Events list */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="p-6 text-center glass-card rounded-2xl">
                <Heart className="w-8 h-8 text-rose-300 dark:text-rose-600/40 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-serif italic text-stone-600 dark:text-stone-300">
                  No events on this day yet.
                </p>
                <p className="text-[11px] text-stone-400 mt-1 mb-3">
                  Plan a cozy dinner, boba run, or surprise date!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPlanDate(selectedDateStr);
                    setIsPlanDateModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/25 transition-colors cursor-pointer"
                >
                  + Plan for this Day
                </button>
              </div>
            ) : (
              selectedDayEvents.map((ev) => {
                const isMilestone = ev.type === 'milestone' || ev.type === 'monthly_anniv';
                const isBday = ev.type === 'birthday';
                const isTodo = ev.type === 'planned_date';

                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMilestone
                        ? 'bg-gradient-to-r from-rose-500/15 to-pink-500/15 border-rose-300/50 dark:border-rose-500/30'
                        : isBday
                        ? 'bg-amber-500/10 border-amber-300/40 dark:border-amber-500/20'
                        : 'glass-card border-white/60 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isMilestone && <Heart className="w-4 h-4 text-rose-500 fill-current" />}
                          {isBday && <Gift className="w-4 h-4 text-amber-500" />}
                          {isTodo && (
                            <button
                              type="button"
                              onClick={() => ev.originalTodoId && onToggleTodo(ev.originalTodoId)}
                              className="text-stone-400 hover:text-rose-500 cursor-pointer"
                            >
                              {ev.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                              {ev.title}
                            </span>
                            {ev.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold">
                                {ev.badge}
                              </span>
                            )}
                          </div>

                          {ev.note && (
                            <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 italic leading-relaxed">
                              &ldquo;{ev.note}&rdquo;
                            </p>
                          )}

                          {isTodo && (
                            <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                              <span>Added by {ev.addedBy ? profile[ev.addedBy]?.nickname : 'Us'}</span>
                              {ev.completed && <span className="text-emerald-500 font-medium">· Completed ✨</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Date Reminder Box */}
          <div className="p-3.5 rounded-2xl glass-card-subtle text-xs space-y-1 border border-white/50 dark:border-white/5">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Couple Calendar Tips
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Dates planned here stay synchronized 24/7 across both {profile.partner1.nickname} and {profile.partner2.nickname}’s phones.
            </p>
          </div>
        </div>
      </div>

      {/* Plan a Date Modal */}
      {isPlanDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md glass-card rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPlanDateModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl glass-card-subtle text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <CalendarHeart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Plan a Couple Date
              </h3>
              <p className="text-xs text-stone-500">
                Overlaid on your shared monthly calendar
              </p>
            </div>

            <form onSubmit={handleCreatePlannedDate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  What are we planning?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Candlelit homemade sushi & wine night"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-card text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Scheduled Date:
                  </label>
                  <input
                    type="date"
                    required
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-card text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={planCategory}
                    onChange={(e) => setPlanCategory(e.target.value as ToDoItem['category'])}
                    className="w-full px-2.5 py-1.5 rounded-xl glass-card text-xs text-stone-800 dark:text-stone-200"
                  >
                    <option value="date">Romantic Date 🍷</option>
                    <option value="movie">Movie Night 🎬</option>
                    <option value="food">Food & Boba 🍜</option>
                    <option value="travel">Road Trip / Travel 🚗</option>
                    <option value="cute">Cute Moment 🧸</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanDateModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-card-subtle text-xs text-stone-600 dark:text-stone-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!planTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-semibold shadow-md disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                >
                  Schedule Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
