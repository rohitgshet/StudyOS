import React, { useState } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { TimetableClass } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { useToast } from '../common/Toast';
import {
  Calendar,
  Plus,
  Clock,
  MapPin,
  User,
  Trash2,
} from 'lucide-react';
import { formatTime } from '../../lib/utils';

export const TimetableView: React.FC = () => {
  const { timetable, subjects, addClass, deleteClass } = useStudyData();
  const toast = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || '',
    day: 'Monday' as TimetableClass['day'],
    startTime: '09:00',
    endTime: '10:30',
    room: 'Hall 101',
    faculty: 'Prof. Smith',
    type: 'Lecture' as TimetableClass['type'],
  });

  const now = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const currentDayName = daysOfWeek[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) {
      toast.error('Please select a subject');
      return;
    }
    addClass(formData);
    toast.success('Class added to timetable');
    setIsAddModalOpen(false);
  };

  const handleDeleteClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this class from timetable?')) {
      deleteClass(id);
      toast.info('Class removed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0071E3]" />
            Academic Timetable
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize lectures, lab sessions, and tutorials. Today is{' '}
            <span className="text-[#0071E3] dark:text-[#38BDF8] font-semibold font-mono">{currentDayName}</span>.
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm"
        >
          Add Class
        </Button>
      </div>

      {/* Day Selector on Mobile / Tabs */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2">
        {['All', ...days].map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-4 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition-all ${
              selectedDay === d
                ? 'bg-[#0071E3] text-white shadow-sm font-semibold'
                : 'bg-white/60 dark:bg-white/[0.06] text-muted-foreground hover:text-foreground border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-md'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Weekly Grid (Desktop 6 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {days
          .filter(d => selectedDay === 'All' || selectedDay === d)
          .map(day => {
            const isToday = currentDayName === day;
            const dayClasses = timetable
              .filter(c => c.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className={`apple-glass-card rounded-3xl p-4 flex flex-col min-h-[480px] shadow-apple-glass dark:shadow-apple-glass-dark ${
                  isToday
                    ? 'border-[#0071E3]/50 ring-2 ring-[#0071E3]/20 bg-gradient-to-b from-[#0071E3]/5 to-transparent'
                    : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.05] dark:border-white/[0.08]">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {day}
                  </span>
                  {isToday ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#0071E3] dark:text-[#38BDF8] font-mono font-medium border border-[#0071E3]/30">
                      Today
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  )}
                </div>

                {/* Day Class Slots */}
                <div className="flex-1 space-y-2.5">
                  {dayClasses.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4 border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl">
                      <p className="text-[11px] text-muted-foreground">No classes</p>
                    </div>
                  ) : (
                    dayClasses.map(cls => {
                      const subject = subjects.find(s => s.id === cls.subjectId);

                      const [startH, startM] = cls.startTime.split(':').map(Number);
                      const [endH, endM] = cls.endTime.split(':').map(Number);
                      const startMin = startH * 60 + startM;
                      const endMin = endH * 60 + endM;
                      const isNow = isToday && currentMinutes >= startMin && currentMinutes <= endMin;

                      return (
                        <div
                          key={cls.id}
                          className={`p-3.5 rounded-2xl border relative transition-all duration-150 group ${
                            isNow
                              ? 'border-[#0071E3]/50 bg-[#0071E3]/10 shadow-sm'
                              : 'border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:border-[#0071E3]/40 hover:bg-white/70 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          {/* Subject Pill & Delete */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span
                              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                backgroundColor: `${subject?.color || '#0071E3'}15`,
                                color: subject?.color || '#0071E3',
                                borderColor: `${subject?.color || '#0071E3'}30`,
                              }}
                            >
                              {subject?.code || 'CLASS'}
                            </span>

                            <div className="flex items-center gap-1">
                              {isNow && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0071E3] text-white font-semibold uppercase animate-pulse">
                                  Now
                                </span>
                              )}
                              <button
                                onClick={e => handleDeleteClass(cls.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#FB7185] p-0.5 transition-opacity"
                                title="Delete Class"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-semibold text-foreground line-clamp-1">
                            {subject?.name || 'Class Session'}
                          </h4>

                          <div className="space-y-1 mt-2 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1 font-mono text-foreground font-medium">
                              <Clock className="w-3 h-3 text-muted-foreground/80" />
                              <span>{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</span>
                            </div>

                            {cls.room && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground/80" />
                                <span>{cls.room}</span>
                              </div>
                            )}

                            {cls.faculty && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground/80" />
                                <span>{cls.faculty}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2.5 pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex justify-between items-center text-[10px]">
                            <span className="text-muted-foreground font-mono">{cls.type}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Class in Timetable"
        description="Add a lecture, lab, tutorial, or seminar to your weekly timetable"
        maxWidth="md"
      >
        <form onSubmit={handleAddClass} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
            <select
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
              required
            >
              <option value="">Select subject...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Day of Week</label>
              <select
                value={formData.day}
                onChange={e => setFormData({ ...formData, day: e.target.value as TimetableClass['day'] })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
              >
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Class Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as TimetableClass['type'] })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab">Lab</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time (24h)"
              type="time"
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time (24h)"
              type="time"
              value={formData.endTime}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Room / Location"
              placeholder="e.g. Gates Hall 104"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
            />
            <Input
              label="Professor / TA"
              placeholder="e.g. Prof. David Karger"
              value={formData.faculty}
              onChange={e => setFormData({ ...formData, faculty: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Schedule Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
