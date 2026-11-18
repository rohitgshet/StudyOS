import React, { useState } from 'react';
import { Subject, SyllabusTopic } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useStudyData } from '../../context/StudyDataContext';
import { useToast } from '../common/Toast';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  FileText,
  Calendar,
  CheckSquare,
  GraduationCap,
} from 'lucide-react';
import { generateId } from '../../lib/utils';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
}) => {
  const { toggleSyllabusTopic, updateSubject, deleteSubject, notes, tasks, exams, timetable } = useStudyData();
  const toast = useToast();
  const [newTopicTitle, setNewTopicTitle] = useState('');

  if (!subject) return null;

  const subjectNotes = notes.filter(n => n.subjectId === subject.id);
  const subjectTasks = tasks.filter(t => t.subjectId === subject.id);
  const subjectExams = exams.filter(e => e.subjectId === subject.id);

  const completedTopics = subject.syllabusTopics.filter(t => t.completed).length;
  const totalTopics = subject.syllabusTopics.length;
  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const newTopic: SyllabusTopic = {
      id: 'top_' + generateId(),
      title: newTopicTitle.trim(),
      completed: false,
    };
    updateSubject(subject.id, {
      syllabusTopics: [...subject.syllabusTopics, newTopic],
    });
    setNewTopicTitle('');
    toast.success('Added syllabus topic');
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${subject.code}: ${subject.name}? This will unassign linked notes and tasks.`)) {
      deleteSubject(subject.id);
      toast.info(`Deleted ${subject.code}`);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${subject.code}: ${subject.name}`}
      description={`${subject.semester} • ${subject.credits} Credits • Room: ${subject.room || 'TBD'} • Faculty: ${subject.faculty || 'TBD'}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Syllabus Completion</span>
              <div className="text-xl font-bold font-mono text-foreground">
                {progressPct}% <span className="text-xs font-normal text-muted-foreground">({completedTopics}/{totalTopics} topics)</span>
              </div>
            </div>
            {subject.targetGrade && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Target Grade</span>
                <div className="text-xl font-extrabold font-mono text-[#0071E3] dark:text-[#38BDF8]">
                  {subject.targetGrade}
                </div>
              </div>
            )}
          </div>

          <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, backgroundColor: subject.color }}
            />
          </div>

          {subject.description && (
            <p className="text-xs text-muted-foreground pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
              {subject.description}
            </p>
          )}
        </div>

        {/* Syllabus Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
              Syllabus & Curriculum Checklist
            </h4>
            <span className="text-[11px] font-mono text-muted-foreground">{completedTopics}/{totalTopics} Mastered</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {subject.syllabusTopics.map(topic => (
              <div
                key={topic.id}
                onClick={() => toggleSyllabusTopic(subject.id, topic.id)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                  topic.completed
                    ? 'border-[#10B981]/20 bg-[#10B981]/8 text-muted-foreground line-through'
                    : 'border-black/[0.05] dark:border-white/[0.06] bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] text-foreground'
                }`}
              >
                {topic.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium select-none">{topic.title}</span>
              </div>
            ))}
          </div>

          {/* Add topic inline input */}
          <form onSubmit={handleAddTopic} className="flex gap-2 pt-1">
            <Input
              placeholder="Add new unit or syllabus topic..."
              value={newTopicTitle}
              onChange={e => setNewTopicTitle(e.target.value)}
              className="text-xs py-1.5"
            />
            <Button type="submit" size="sm" icon={<Plus className="w-3.5 h-3.5" />} className="bg-[#0071E3] text-white">
              Add
            </Button>
          </form>
        </div>

        {/* Linked Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
          <div className="p-3.5 bg-white/40 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <FileText className="w-3.5 h-3.5 text-[#F472B6]" />
              <span>Notes ({subjectNotes.length})</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {subjectNotes.length > 0 ? subjectNotes[0].title : 'No notes yet'}
            </p>
          </div>

          <div className="p-3.5 bg-white/40 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CheckSquare className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Tasks ({subjectTasks.length})</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {subjectTasks.filter(t => t.status !== 'completed').length} pending
            </p>
          </div>

          <div className="p-3.5 bg-white/40 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-[#FB7185]" />
              <span>Exams ({subjectExams.length})</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {subjectExams[0] ? subjectExams[0].title : 'No exams'}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleDelete}>
            Delete Subject
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
