import React, { useMemo } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  Flame,
  Calendar,
  Award,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { focusSessions, tasks, subjects } = useStudyData();
  const { user } = useAuth();

  const totalFocusMinutes = useMemo(() => {
    return focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [focusSessions]);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const averageSessionMins = focusSessions.length > 0 ? Math.round(totalFocusMinutes / focusSessions.length) : 0;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Last 7 Days
  const weeklyData = useMemo(() => {
    const days: { day: string; date: string; minutes: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayMins = focusSessions
        .filter(s => s.completedAt.startsWith(dateStr))
        .reduce((acc, s) => acc + s.durationMinutes, 0);

      days.push({
        day: dayName,
        date: dateStr,
        minutes: dayMins,
      });
    }
    return days;
  }, [focusSessions]);

  const maxWeeklyMins = Math.max(...weeklyData.map(d => d.minutes), 60);

  // Subject-wise Time Distribution
  const subjectDistribution = useMemo(() => {
    const map = new Map<string, number>();

    focusSessions.forEach(s => {
      const key = s.subjectId || 'general';
      map.set(key, (map.get(key) || 0) + s.durationMinutes);
    });

    return Array.from(map.entries()).map(([subId, mins]) => {
      const subject = subjects.find(s => s.id === subId);
      return {
        id: subId,
        name: subject ? `${subject.code}: ${subject.name}` : 'General Study',
        color: subject?.color || '#0071E3',
        minutes: mins,
        hours: (mins / 60).toFixed(1),
        percentage: totalFocusMinutes > 0 ? Math.round((mins / totalFocusMinutes) * 100) : 0,
      };
    });
  }, [focusSessions, subjects, totalFocusMinutes]);

  // Heatmap Simulation
  const heatmapDays = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const count = focusSessions.filter(s => s.completedAt.startsWith(dateStr)).length;
      days.push({ date: dateStr, count });
    }
    return days;
  }, [focusSessions]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#0071E3]" />
          Academic Productivity & Trends
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Detailed metrics on study hours, subject distribution, and consistency.
        </p>
      </div>

      {/* 4 Stat Metric Cards (Apple Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="apple-glass-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Focus Hours</span>
            <Clock className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {totalFocusHours} <span className="text-xs font-normal text-muted-foreground">hours</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {focusSessions.length} total logged sessions
          </p>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Assignment Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {taskCompletionRate}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {completedTasks} of {tasks.length} tasks completed
          </p>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Active Study Streak</span>
            <Flame className="w-4 h-4 text-[#FB7185] fill-[#FB7185]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#E11D48] dark:text-[#FDA4AF]">
            {user?.streak || 1} Days
          </div>
          <p className="text-[11px] text-muted-foreground">
            Consistent daily learning
          </p>
        </div>

        <div className="apple-glass-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Avg Session Length</span>
            <Award className="w-4 h-4 text-[#DEC5A6]" />
          </div>
          <div className="text-2xl font-bold font-mono text-foreground">
            {averageSessionMins} <span className="text-xs font-normal text-muted-foreground">mins</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Optimal concentration interval
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Focus Hours Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Daily Focus Time (Last 7 Days)</h3>
              <p className="text-xs text-muted-foreground">Minutes studied per day</p>
            </div>
            <span className="text-xs font-mono text-[#0071E3] dark:text-[#38BDF8] font-medium">
              Goal: {user?.studyGoalMinutesPerDay || 180}m/day
            </span>
          </div>

          <div className="h-64 pt-8 flex items-end justify-between gap-4">
            {weeklyData.map(d => {
              const heightPercent = Math.max(8, Math.round((d.minutes / maxWeeklyMins) * 100));
              const isGoalMet = d.minutes >= (user?.studyGoalMinutesPerDay || 180);

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.minutes}m
                  </span>
                  <div
                    className={`w-full max-w-[38px] rounded-t-2xl transition-all duration-300 ${
                      isGoalMet
                        ? 'bg-gradient-to-t from-[#10B981] to-[#34D399] shadow-2xs'
                        : 'bg-gradient-to-t from-[#0071E3] to-[#38BDF8] shadow-2xs'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <div className="text-center pt-1.5">
                    <span className="text-xs font-bold font-mono text-foreground block">
                      {d.day}
                    </span>
                    <span className="text-[9px] text-muted-foreground block">
                      {d.date.substring(5)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-wise Time Allocation (4 Cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Subject Time Allocation</h3>

          {subjectDistribution.length === 0 ? (
            <p className="text-xs text-muted-foreground">No focus sessions logged yet.</p>
          ) : (
            <div className="space-y-4">
              {subjectDistribution.map(item => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate pr-2">{item.name}</span>
                    <span className="font-mono text-muted-foreground shrink-0">{item.hours}h ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GitHub-style Study Activity Heatmap */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0071E3]" />
            <h3 className="text-sm font-semibold text-foreground">Study Consistency Heatmap (Past 4 Weeks)</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {heatmapDays.filter(d => d.count > 0).length} of 28 Active Days
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {heatmapDays.map(d => {
            let bg = 'bg-black/[0.04] dark:bg-white/[0.06]';
            if (d.count === 1) bg = 'bg-[#0071E3]/25 text-[#0071E3] font-bold';
            else if (d.count === 2) bg = 'bg-[#0071E3]/55 text-white font-bold';
            else if (d.count >= 3) bg = 'bg-gradient-to-tr from-[#0071E3] to-[#F472B6] text-white font-bold shadow-2xs';

            return (
              <div
                key={d.date}
                className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center text-[10px] font-mono hover:scale-110 transition-transform cursor-pointer border border-black/[0.03] dark:border-white/[0.04]`}
                title={`${d.date}: ${d.count} study sessions`}
              >
                {d.count > 0 ? d.count : ''}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Less</span>
          <div className="w-3 h-3 rounded-md bg-black/[0.04] dark:bg-white/[0.06]" />
          <div className="w-3 h-3 rounded-md bg-[#0071E3]/25" />
          <div className="w-3 h-3 rounded-md bg-[#0071E3]/55" />
          <div className="w-3 h-3 rounded-md bg-gradient-to-tr from-[#0071E3] to-[#F472B6]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
