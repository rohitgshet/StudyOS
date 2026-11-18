import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  FileText,
  Calendar,
  CheckSquare,
  GraduationCap,
  Timer,
  Sparkles,
  BarChart3,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { ViewType } from '../../types';
import { useStudyData } from '../../context/StudyDataContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
  onOpenSubject?: (subjectId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { subjects, notes, tasks } = useStudyData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseNavigation: { title: string; category: string; icon: React.ReactNode; action: () => void }[] = [
    { title: 'Overview Dashboard', category: 'Navigation', icon: <Search className="w-4 h-4" />, action: () => { onNavigate('dashboard'); onClose(); } },
    { title: 'My Subjects', category: 'Navigation', icon: <BookOpen className="w-4 h-4 text-[#0071E3]" />, action: () => { onNavigate('subjects'); onClose(); } },
    { title: 'Smart Notes', category: 'Navigation', icon: <FileText className="w-4 h-4 text-[#F472B6]" />, action: () => { onNavigate('notes'); onClose(); } },
    { title: 'Weekly Timetable', category: 'Navigation', icon: <Calendar className="w-4 h-4 text-[#0071E3]" />, action: () => { onNavigate('timetable'); onClose(); } },
    { title: 'Task Manager', category: 'Navigation', icon: <CheckSquare className="w-4 h-4 text-[#10B981]" />, action: () => { onNavigate('tasks'); onClose(); } },
    { title: 'Exam Planner', category: 'Navigation', icon: <GraduationCap className="w-4 h-4 text-[#FB7185]" />, action: () => { onNavigate('exams'); onClose(); } },
    { title: 'Focus Timer', category: 'Navigation', icon: <Timer className="w-4 h-4 text-[#0071E3]" />, action: () => { onNavigate('focus'); onClose(); } },
    { title: 'AI Study Assistant', category: 'Navigation', icon: <Sparkles className="w-4 h-4 text-[#F472B6]" />, action: () => { onNavigate('ai'); onClose(); } },
    { title: 'Analytics', category: 'Navigation', icon: <BarChart3 className="w-4 h-4 text-[#38BDF8]" />, action: () => { onNavigate('analytics'); onClose(); } },
    { title: 'Settings', category: 'Navigation', icon: <Settings className="w-4 h-4 text-muted-foreground" />, action: () => { onNavigate('settings'); onClose(); } },
  ];

  const subjectItems = subjects.map(s => ({
    title: `${s.code}: ${s.name}`,
    category: 'Subjects',
    icon: <BookOpen className="w-4 h-4" style={{ color: s.color }} />,
    action: () => { onNavigate('subjects'); onClose(); },
  }));

  const noteItems = notes.map(n => ({
    title: n.title,
    category: 'Notes',
    icon: <FileText className="w-4 h-4 text-[#F472B6]" />,
    action: () => { onNavigate('notes'); onClose(); },
  }));

  const taskItems = tasks.filter(t => t.status !== 'completed').map(t => ({
    title: t.title,
    category: 'Tasks',
    icon: <CheckSquare className="w-4 h-4 text-[#0071E3]" />,
    action: () => { onNavigate('tasks'); onClose(); },
  }));

  const allItems = [...baseNavigation, ...subjectItems, ...noteItems, ...taskItems];

  const filteredItems = query.trim() === ''
    ? baseNavigation
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      {/* Apple Spotlight Backdrop */}
      <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-xl animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-lg apple-glass border border-white/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 animate-slide-up">
        {/* Spotlight Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-black/[0.05] dark:border-white/[0.08] bg-transparent">
          <Search className="w-4 h-4 text-[#0071E3] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight: Jump to notes, subjects, tasks..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          <kbd className="text-[10px] bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] px-2 py-0.5 rounded-lg font-mono text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2.5 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#0071E3]/15 text-[#0071E3] dark:text-[#38BDF8] font-semibold' : 'text-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-muted-foreground font-mono">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#0071E3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 border-t border-black/[0.05] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with <kbd className="font-mono bg-white/70 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/[0.08]">↑</kbd> <kbd className="font-mono bg-white/70 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/[0.08]">↓</kbd></span>
          <span>Open with <kbd className="font-mono bg-white/70 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/[0.06] dark:border-white/[0.08]">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
