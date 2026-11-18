import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  CheckSquare,
  GraduationCap,
  Timer,
  Sparkles,
  BarChart3,
  Settings,
  ChevronRight,
  Flame,
  LogOut,
  User,
} from 'lucide-react';
import { ViewType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStudyData } from '../../context/StudyDataContext';
import { cn } from '../../lib/utils';
import { sound } from '../../lib/sound';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();
  const { tasks, exams, notes } = useStudyData();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const upcomingExamsCount = exams.length;

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'subjects', label: 'My Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'notes', label: 'Smart Notes', icon: <FileText className="w-4 h-4" />, badge: notes.length },
    { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasksCount || undefined },
    { id: 'exams', label: 'Exam Planner', icon: <GraduationCap className="w-4 h-4" />, badge: upcomingExamsCount || undefined },
    { id: 'focus', label: 'Focus Mode', icon: <Timer className="w-4 h-4" /> },
    { id: 'ai', label: 'AI Assistant', icon: <Sparkles className="w-4 h-4 text-[#F472B6]" />, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleSelect = (view: ViewType) => {
    sound.playTick();
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-md transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 apple-glass border-r flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand / Logo (Apple-style frosted pill) */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071E3] via-[#38BDF8] to-[#F472B6] p-[1px] shadow-sm">
              <div className="w-full h-full bg-white/90 dark:bg-[#1C1917]/90 rounded-[11px] flex items-center justify-center">
                <span className="font-semibold text-xs tracking-tighter bg-gradient-to-r from-[#0071E3] to-[#F472B6] bg-clip-text text-transparent">
                  S•OS
                </span>
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                StudyOS
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F472B6]/15 text-[#DB2777] dark:text-[#FDA4AF] font-medium border border-[#F472B6]/25">
                  Apple Air
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground">Academic OS</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </div>

          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group text-left',
                  isActive
                    ? 'bg-[#0071E3]/12 text-[#0071E3] dark:text-[#38BDF8] border border-[#0071E3]/25 shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('transition-colors', isActive ? 'text-[#0071E3] dark:text-[#38BDF8]' : 'group-hover:text-foreground')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors',
                      item.badge === 'AI'
                        ? 'bg-gradient-to-r from-[#F472B6]/20 to-[#0071E3]/20 text-[#DB2777] dark:text-[#F9A8D4] border border-[#F472B6]/30 font-semibold'
                        : isActive
                        ? 'bg-[#0071E3]/20 text-[#0071E3] dark:text-[#38BDF8]'
                        : 'bg-black/[0.05] dark:bg-white/[0.08] text-muted-foreground'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Streak & Focus widget in Apple Creme & Light Pink Card */}
        <div className="p-3 mx-3 mb-3 bg-gradient-to-br from-[#FFF5F7]/80 via-white/60 to-[#F0F7FF]/80 dark:from-[#261E22]/60 dark:via-[#1C1A17]/60 dark:to-[#16202A]/60 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl space-y-2 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/80 flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-[#FB7185] fill-[#FB7185]" />
              Study Streak
            </span>
            <span className="text-xs font-bold text-[#E11D48] dark:text-[#FDA4AF] font-mono">
              {user?.streak || 1} Days
            </span>
          </div>
          <div className="w-full bg-black/[0.06] dark:bg-white/[0.1] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FB7185] to-[#0071E3] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((user?.streak || 1) / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.08]">
          <div
            onClick={onOpenProfile}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071E3]/20 to-[#F472B6]/30 border border-white/60 dark:border-white/10 flex items-center justify-center text-[#0071E3] dark:text-[#38BDF8] font-semibold text-xs overflow-hidden shrink-0 shadow-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.major || 'Undergraduate'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0" />
          </div>

          <div className="mt-1 flex items-center justify-between px-2 pt-1">
            <button
              onClick={logout}
              className="text-[11px] text-muted-foreground hover:text-[#FB7185] flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
            <span className="text-[10px] font-mono text-muted-foreground/60">macOS Design</span>
          </div>
        </div>
      </aside>
    </>
  );
};
