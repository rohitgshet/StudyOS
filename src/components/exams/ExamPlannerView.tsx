import React, { useState } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Exam } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../common/Toast';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { formatDate, formatTime, generateId } from '../../lib/utils';
import confetti from 'canvas-confetti';

export const ExamPlannerView: React.FC = () => {
  const { exams, subjects, addExam, updateExam, deleteExam, updateExamTopicStatus } = useStudyData();
  const toast = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(exams[0] || null);

  // New exam form state
  const [formData, setFormData] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    startTime: '09:00',
    durationMinutes: 120,
    room: 'Hall 200',
    weightagePercent: 30,
    targetScore: 90,
    notes: '',
  });

  const [newTopicInput, setNewTopicInput] = useState('');

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const created = addExam({
      ...formData,
      topics: [
        { id: 'top_e1', name: 'Core Foundations & Definitions', status: 'mastered' },
        { id: 'top_e2', name: 'Major Theorems & Formula Derivations', status: 'reviewing' },
        { id: 'top_e3', name: 'Past Paper Problems & Edge Cases', status: 'not_started' },
      ],
    });

    toast.success('Exam registered to planner');
    setIsAddModalOpen(false);
    setSelectedExam(created);
  };

  const handleAddTopicToExam = (examId: string) => {
    if (!newTopicInput.trim()) return;
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    updateExam(examId, {
      topics: [
        ...exam.topics,
        { id: 'et_' + generateId(), name: newTopicInput.trim(), status: 'not_started' },
      ],
    });
    setNewTopicInput('');
    toast.success('Topic added to checklist');
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('Delete this exam entry?')) {
      deleteExam(id);
      toast.info('Exam removed');
      const remaining = exams.filter(e => e.id !== id);
      setSelectedExam(remaining[0] || null);
    }
  };

  const handleTopicCycle = (examId: string, topicId: string, currentStatus: string) => {
    const nextStatus =
      currentStatus === 'not_started'
        ? 'reviewing'
        : currentStatus === 'reviewing'
        ? 'mastered'
        : 'not_started';

    updateExamTopicStatus(examId, topicId, nextStatus as 'not_started' | 'reviewing' | 'mastered');

    if (nextStatus === 'mastered') {
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch {}
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#F472B6]" />
            Exam Planner & Countdown
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Countdown timers, high-yield syllabus mastery, and readiness tracking.
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm"
        >
          Add Exam
        </Button>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No exams scheduled"
          description="Register your midterm, finals, or quizzes to get countdown alerts and syllabus tracking."
          actionLabel="Schedule Exam"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Exams List & Countdowns (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Registered Exams ({exams.length})
            </h3>

            {exams.map(exam => {
              const subject = subjects.find(s => s.id === exam.subjectId);
              const isSelected = selectedExam?.id === exam.id;

              const examDate = new Date(exam.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              const masteredTopics = exam.topics.filter(t => t.status === 'mastered').length;
              const readiness = exam.topics.length > 0 ? Math.round((masteredTopics / exam.topics.length) * 100) : 0;

              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`p-4 rounded-3xl border cursor-pointer transition-all duration-150 space-y-2.5 ${
                    isSelected
                      ? 'apple-glass border-[#F472B6]/50 shadow-apple-glass dark:shadow-apple-glass-dark ring-1 ring-[#F472B6]/20'
                      : 'apple-glass-card hover:border-[#0071E3]/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: `${subject?.color || '#0071E3'}15`,
                          color: subject?.color || '#0071E3',
                          borderColor: `${subject?.color || '#0071E3'}30`,
                        }}
                      >
                        {subject?.code || 'EXAM'}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground mt-1.5">{exam.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(exam.date)} at {formatTime(exam.startTime)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xl font-extrabold font-mono ${daysLeft <= 7 ? 'text-[#E11D48] dark:text-[#FDA4AF]' : 'text-[#0071E3] dark:text-[#38BDF8]'}`}>
                        {daysLeft <= 0 ? 'Today!' : `${daysLeft}d`}
                      </span>
                      <p className="text-[10px] text-muted-foreground">remaining</p>
                    </div>
                  </div>

                  {/* Readiness Bar */}
                  <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Syllabus Readiness</span>
                      <span className="font-mono font-medium text-foreground">{readiness}%</span>
                    </div>
                    <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#F472B6] to-[#0071E3] h-full rounded-full transition-all duration-300"
                        style={{ width: `${readiness}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Exam In-Depth Checklist & Revision Strategy (7 Cols) */}
          {selectedExam && (
            <div className="lg:col-span-7 apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-6">
              {/* Detailed Countdown Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#F472B6]">
                      {subjects.find(s => s.id === selectedExam.subjectId)?.name || 'Course Examination'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{selectedExam.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(selectedExam.date)}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedExam.durationMinutes} mins
                    </span>
                    {selectedExam.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedExam.room}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-black/[0.06] sm:dark:border-white/[0.08] sm:pl-4">
                  <span className="text-xs text-muted-foreground">Weightage</span>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {selectedExam.weightagePercent}% <span className="text-xs font-normal text-muted-foreground">of Grade</span>
                  </div>
                  {selectedExam.targetScore && (
                    <span className="text-[11px] font-mono text-[#059669] dark:text-[#34D399]">
                      Target: {selectedExam.targetScore}%
                    </span>
                  )}
                </div>
              </div>

              {/* Revision Instructions / Notes */}
              {selectedExam.notes && (
                <div className="p-3.5 bg-[#FFF5F7] dark:bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-2xl text-xs text-foreground space-y-1">
                  <span className="font-semibold text-[#E11D48] dark:text-[#FDA4AF] block">Exam Instructions & Notes:</span>
                  <p className="text-muted-foreground">{selectedExam.notes}</p>
                </div>
              )}

              {/* High-Yield Topics Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                    High-Yield Topics & Revision Checklist
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Click topic pill to toggle mastery</span>
                </div>

                <div className="space-y-2">
                  {selectedExam.topics.map(topic => {
                    const statusConfig = {
                      mastered: { label: 'Mastered', color: 'bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] border-[#10B981]/30' },
                      reviewing: { label: 'Reviewing', color: 'bg-[#DEC5A6]/30 text-[#92400E] dark:text-[#FDE68A] border-[#DEC5A6]/40' },
                      not_started: { label: 'Not Started', color: 'bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground border-transparent' },
                    }[topic.status];

                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicCycle(selectedExam.id, topic.id, topic.status)}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70 dark:hover:bg-white/[0.06] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {topic.status === 'mastered' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                          ) : topic.status === 'reviewing' ? (
                            <AlertCircle className="w-4 h-4 text-[#DEC5A6] shrink-0" />
                          ) : (
                            <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-xs font-medium text-foreground select-none">{topic.name}</span>
                        </div>

                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border shadow-2xs ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Add new topic */}
                <div className="flex gap-2 pt-2">
                  <Input
                    placeholder="Add topic to exam revision checklist..."
                    value={newTopicInput}
                    onChange={e => setNewTopicInput(e.target.value)}
                    className="text-xs"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopicToExam(selectedExam.id);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddTopicToExam(selectedExam.id)}
                  >
                    Add Topic
                  </Button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleDeleteExam(selectedExam.id)}
                >
                  Delete Exam
                </Button>

                <div className="text-xs text-muted-foreground font-mono">
                  Updated in real-time
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Examination"
        description="Add examination date, room, and syllabus weightage"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExam} className="space-y-3.5">
          <Input
            label="Exam Title"
            placeholder="e.g. CS 301 Midterm Examination"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
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
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Exam Date"
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="Duration (mins)"
              type="number"
              value={formData.durationMinutes}
              onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              required
            />
            <Input
              label="Hall / Room"
              placeholder="e.g. Hall 200"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Grade Weightage (%)"
              type="number"
              min="1"
              max="100"
              value={formData.weightagePercent}
              onChange={e => setFormData({ ...formData, weightagePercent: Number(e.target.value) })}
            />
            <Input
              label="Target Score (%)"
              type="number"
              min="1"
              max="100"
              value={formData.targetScore}
              onChange={e => setFormData({ ...formData, targetScore: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Notes / Permitted Materials</label>
            <textarea
              rows={2}
              placeholder="e.g. 1 cheat sheet allowed, bring non-programmable calculator..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl p-3 outline-none focus:border-[#0071E3] backdrop-blur-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Schedule Exam</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
