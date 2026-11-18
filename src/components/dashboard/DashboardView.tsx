import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Timer,
  ArrowRight,
  Plus,
  BookOpen,
  GraduationCap,
  Sparkles,
  Flame,
} from 'lucide-react';
import { ViewType, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStudyData } from '../../context/StudyDataContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate, getRelativeTimeString, formatTime } from '../../lib/utils';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenQuickActions: (tab?: 'task' | 'note' | 'focus') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickActions,
}) => {
  const { user } = useAuth();
  const { subjects, tasks, timetable, exams, notes, focusSessions, toggleTaskStatus } = useStudyData();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const todayDayName = daysOfWeek[new Date().getDay()];

  // Today's classes
  const todayClasses = timetable
    .filter(c => c.day === todayDayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const activeOrUpcomingClass = todayClasses.find(c => {
    const [startH, startM] = c.startTime.split(':').map(Number);
    const [endH, endM] = c.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    return currentMinutes <= endMin;
  });

  // Calculate today's focus minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFocusMinutes = focusSessions
    .filter(s => s.completedAt.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const dailyGoal = user?.studyGoalMinutesPerDay || 180;
  const focusGoalPercent = Math.min(100, Math.round((todayFocusMinutes / dailyGoal) * 100));

  // Upcoming tasks
  const upcomingTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Upcoming exams
  const upcomingExams = [...exams]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Recent notes
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Overall syllabus completion
  const totalTopics = subjects.reduce((acc, s) => acc + s.syllabusTopics.length, 0);
  const completedTopics = subjects.reduce(
    (acc, s) => acc + s.syllabusTopics.filter(t => t.completed).length,
    0
  );
  const syllabusProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* 1. Apple Glass Header Greeting Banner */}
      <div className="relative overflow-hidden apple-glass-card p-6 sm:p-8 rounded-3xl border border-white/70 dark:border-white/10 shadow-apple-glass dark:shadow-apple-glass-dark">
        {/* Soft Pink and Blue Ambient Diffusion */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F472B6]/15 via-[#0071E3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-gradient-to-tr from-[#DEC5A6]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-white/10 text-[#0071E3] dark:text-[#38BDF8] border border-[#0071E3]/20 backdrop-blur-md">
                {user?.university || 'Academic Workspace'} • {user?.semester || 'Term 2026'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Your personalized academic command system. You have{' '}
              <span className="text-foreground font-semibold font-mono">{todayClasses.length} classes</span> today and{' '}
              <span className="text-foreground font-semibold font-mono">{upcomingTasks.length} pending deadlines</span>.
            </p>
          </div>

          {/* Quick Actions Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              icon={<Timer className="w-3.5 h-3.5 text-[#0071E3]" />}
              onClick={() => onNavigate('focus')}
            >
              Focus Mode
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<FileText className="w-3.5 h-3.5 text-[#F472B6]" />}
              onClick={() => onOpenQuickActions('note')}
            >
              New Note
            </Button>
            <Button
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onOpenQuickActions('task')}
              className="bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm"
            >
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Apple Glass Metric Pills Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card (Blush Pink Accent) */}
        <div className="apple-glass-card p-5 rounded-2xl space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Study Streak</span>
            <span className="text-[#FB7185] font-bold text-xs bg-[#FFF5F7] dark:bg-[#FB7185]/15 px-2.5 py-0.5 rounded-full border border-[#FB7185]/30">
              🔥 {user?.streak || 1} Days
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {user?.streak || 1} <span className="text-xs font-normal text-muted-foreground">Days in a row</span>
          </div>
          <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FB7185] to-[#F472B6] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((user?.streak || 1) / 30) * 100)}%` }}
            />
          </div>
        </div>

        {/* Focus time today (Apple Blue Accent) */}
        <div
          onClick={() => onNavigate('focus')}
          className="apple-glass-card p-5 rounded-2xl space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Today's Focus Time</span>
            <span className="text-xs font-mono text-[#0071E3] dark:text-[#38BDF8] font-semibold">{focusGoalPercent}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {todayFocusMinutes} <span className="text-xs font-normal text-muted-foreground">/ {dailyGoal} mins</span>
          </div>
          <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0071E3] h-full rounded-full transition-all duration-500"
              style={{ width: `${focusGoalPercent}%` }}
            />
          </div>
        </div>

        {/* Pending Tasks (Warm Creme Accent) */}
        <div
          onClick={() => onNavigate('tasks')}
          className="apple-glass-card p-5 rounded-2xl space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Assignments & Tasks</span>
            <span className="text-xs font-mono text-[#DB2777] dark:text-[#FDA4AF] font-semibold">{upcomingTasks.length} Left</span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {tasks.filter(t => t.status === 'completed').length} / {tasks.length}{' '}
            <span className="text-xs font-normal text-muted-foreground">Done</span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {upcomingTasks[0] ? `Next: ${upcomingTasks[0].title}` : 'All caught up!'}
          </p>
        </div>

        {/* Syllabus Progress */}
        <div
          onClick={() => onNavigate('subjects')}
          className="apple-glass-card p-5 rounded-2xl space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Syllabus Mastery</span>
            <span className="text-xs font-mono text-[#059669] dark:text-[#34D399] font-semibold">{syllabusProgress}%</span>
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {completedTopics} / {totalTopics}{' '}
            <span className="text-xs font-normal text-muted-foreground">Topics</span>
          </div>
          <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#10B981] to-[#38BDF8] h-full rounded-full transition-all duration-500"
              style={{ width: `${syllabusProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Timetable Widget */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0071E3]" />
                <h2 className="text-sm font-semibold text-foreground">Today's Timetable ({todayDayName})</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('timetable')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Full Week <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl">
                No classes scheduled for today. Great day for deep focus study!
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayClasses.map(cls => {
                  const subject = subjects.find(s => s.id === cls.subjectId);
                  const isCurrent = activeOrUpcomingClass?.id === cls.id;

                  return (
                    <div
                      key={cls.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-[#0071E3]/40 bg-[#0071E3]/8 dark:bg-[#0071E3]/15 shadow-sm'
                          : 'border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-10 rounded-full"
                          style={{ backgroundColor: subject?.color || '#0071E3' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {subject?.code}: {subject?.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#0071E3] dark:text-[#38BDF8] font-mono font-medium animate-pulse border border-[#0071E3]/30">
                                Live Now
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {cls.room} • {cls.faculty} ({cls.type})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Tasks with Apple Pill Styling */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <h2 className="text-sm font-semibold text-foreground">Assignments & Deadlines</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('tasks')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                All Tasks ({tasks.length}) <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl">
                ✨ All assignments completed!
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((t: Task) => {
                  const subject = subjects.find(s => s.id === t.subjectId);
                  const isUrgent = t.priority === 'urgent' || t.priority === 'high';

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:border-[#0071E3]/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={t.status === 'completed'}
                          onChange={() => toggleTaskStatus(t.id)}
                          className="w-4 h-4 rounded-md border-border text-[#0071E3] focus:ring-[#0071E3] cursor-pointer accent-[#0071E3]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-[#0071E3] transition-colors">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {subject && (
                              <span
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${subject.color}15`,
                                  color: subject.color,
                                  borderColor: `${subject.color}30`,
                                }}
                              >
                                {subject.code}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {t.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={isUrgent ? 'danger' : 'default'}
                          size="sm"
                          className="font-mono"
                        >
                          {getRelativeTimeString(t.dueDate)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Upcoming Examinations Countdown */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#F472B6]" />
                <h2 className="text-sm font-semibold text-foreground">Upcoming Exams</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('exams')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Plan <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl">
                No upcoming exams registered.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map(exam => {
                  const subject = subjects.find(s => s.id === exam.subjectId);
                  const examDate = new Date(exam.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const masteredCount = exam.topics.filter(t => t.status === 'mastered').length;
                  const readinessPct = exam.topics.length > 0 ? Math.round((masteredCount / exam.topics.length) * 100) : 0;

                  return (
                    <div
                      key={exam.id}
                      onClick={() => onNavigate('exams')}
                      className="p-4 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:border-[#F472B6]/40 transition-colors cursor-pointer space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${subject?.color || '#0071E3'}15`,
                              color: subject?.color || '#0071E3',
                              borderColor: `${subject?.color || '#0071E3'}30`,
                            }}
                          >
                            {subject?.code || 'EXAM'}
                          </span>
                          <h3 className="text-xs font-semibold text-foreground mt-1.5">{exam.title}</h3>
                          <p className="text-[11px] text-muted-foreground">
                            {formatDate(exam.date)} at {formatTime(exam.startTime)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`text-xl font-extrabold font-mono ${diffDays <= 7 ? 'text-[#E11D48] dark:text-[#FDA4AF]' : 'text-[#0071E3] dark:text-[#38BDF8]'}`}>
                            {diffDays <= 0 ? 'Today!' : `${diffDays}d`}
                          </span>
                          <p className="text-[10px] text-muted-foreground">countdown</p>
                        </div>
                      </div>

                      {/* Readiness bar */}
                      <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Syllabus Readiness</span>
                          <span className="font-mono font-medium text-foreground">{readinessPct}%</span>
                        </div>
                        <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#F472B6] to-[#0071E3] h-full rounded-full transition-all"
                            style={{ width: `${readinessPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Apple Intelligence Style AI Assistant Card (Holographic Pink & Blue Light) */}
          <div className="relative overflow-hidden apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark border border-white/80 dark:border-white/10 space-y-3">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F472B6]/25 to-[#0071E3]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0071E3] via-[#38BDF8] to-[#F472B6] p-[1px]">
                <div className="w-full h-full bg-white dark:bg-[#1C1917] rounded-full flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                </div>
              </div>
              <h2 className="text-sm font-semibold text-foreground">AI Study Assistant</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Synthesize difficult lecture concepts, generate active recall flashcards, and build exam revision schedules.
            </p>
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-[#0071E3] to-[#005BB6] hover:opacity-95 text-white gap-2 shadow-sm rounded-xl"
              onClick={() => onNavigate('ai')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Assistant
            </Button>
          </div>

          {/* Recent Notes */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F472B6]" />
                <h2 className="text-sm font-semibold text-foreground">Recent Notes</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('notes')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                All Notes <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="space-y-2">
              {recentNotes.map(n => {
                const subject = subjects.find(s => s.id === n.subjectId);
                return (
                  <div
                    key={n.id}
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {subject ? subject.code : 'General'} • {n.tags.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {formatDate(n.updatedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
