import React from 'react';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Plus,
  Flame,
} from 'lucide-react';
import { ViewType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface HeaderProps {
  currentView: ViewType;
  onOpenSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenQuickActions: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenSidebar,
  onOpenCommandPalette,
  onOpenQuickActions,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const titles: Record<ViewType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Overview', subtitle: 'Academic Command Center' },
    subjects: { title: 'My Subjects', subtitle: 'Curriculum & Syllabus' },
    notes: { title: 'Smart Notes', subtitle: 'Markdown Knowledge Base' },
    timetable: { title: 'Timetable', subtitle: 'Weekly Class Schedule' },
    tasks: { title: 'Tasks & Deadlines', subtitle: 'Assignments & Projects' },
    exams: { title: 'Exam Planner', subtitle: 'Countdown & Readiness' },
    focus: { title: 'Focus Mode', subtitle: 'Pomodoro & Ambient Audio' },
    ai: { title: 'AI Study Assistant', subtitle: 'Intelligent Tutor & Flashcards' },
    analytics: { title: 'Analytics', subtitle: 'Productivity Trends' },
    settings: { title: 'Settings', subtitle: 'Workspace & Cloud Sync' },
  };

  const current = titles[currentView] || { title: 'StudyOS', subtitle: 'Workspace' };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 h-16 apple-glass border-b border-black/[0.05] dark:border-white/[0.08] px-4 lg:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
            {current.title}
          </h2>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Apple Spotlight / Raycast style command palette trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.05] hover:bg-white/80 dark:hover:bg-white/[0.1] text-xs text-muted-foreground hover:text-foreground transition-all duration-150 shadow-2xs backdrop-blur-md"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="hidden md:inline">Spotlight</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] px-1.5 py-0.5 rounded-md font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Date badge */}
        <div className="hidden xl:flex items-center px-2.5 py-1 text-xs text-muted-foreground border border-black/[0.06] dark:border-white/[0.08] rounded-xl bg-white/40 dark:bg-white/[0.04] backdrop-blur-md">
          {todayFormatted}
        </div>

        {/* Streak counter with Apple blush flame */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF5F7] dark:bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FDA4AF] border border-[#FB7185]/25 text-xs font-semibold shadow-2xs">
          <Flame className="w-3.5 h-3.5 fill-[#FB7185]" />
          <span>{user?.streak || 1}d</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FDE047]" /> : <Moon className="w-4 h-4 text-[#0071E3]" />}
        </button>

        {/* Quick action button (Apple Blue) */}
        <Button
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={onOpenQuickActions}
          className="hidden sm:inline-flex shadow-sm bg-[#0071E3] hover:bg-[#005BB6] text-white border-0"
        >
          Quick Add
        </Button>
      </div>
    </header>
  );
};
