import React, { useState } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Subject } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import { SubjectDetailModal } from './SubjectDetailModal';
import { useToast } from '../common/Toast';
import {
  BookOpen,
  Plus,
  Layers,
  GraduationCap,
  Users,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { SUBJECT_COLORS } from '../../lib/utils';

export const SubjectsView: React.FC = () => {
  const { subjects, addSubject, notes, tasks } = useStudyData();
  const toast = useToast();

  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Subject Form
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    semester: 'Semester 5 (Fall 2026)',
    color: '#0071E3',
    credits: 4,
    faculty: '',
    room: '',
    description: '',
    targetGrade: 'A',
  });

  const semesters = ['All', ...Array.from(new Set(subjects.map(s => s.semester)))];

  const filteredSubjects = selectedSemester === 'All'
    ? subjects
    : subjects.filter(s => s.semester === selectedSemester);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Subject code and name are required');
      return;
    }

    addSubject({
      ...formData,
      credits: Number(formData.credits),
      syllabusTopics: [
        { id: 'top_1', title: 'Course Overview & Fundamentals', completed: false },
        { id: 'top_2', title: 'Core Principles & Theory', completed: false },
        { id: 'top_3', title: 'Advanced Applications & Projects', completed: false },
      ],
    });

    toast.success(`Created subject ${formData.code}`);
    setIsAddModalOpen(false);
    setFormData({
      code: '',
      name: '',
      semester: 'Semester 5 (Fall 2026)',
      color: '#0071E3',
      credits: 4,
      faculty: '',
      room: '',
      description: '',
      targetGrade: 'A',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0071E3]" />
            My Subjects & Curriculum
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize coursework, syllabus topics, and track completion progress across semesters.
          </p>
        </div>

        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="shadow-sm self-start sm:self-auto bg-[#0071E3] hover:bg-[#005BB6] text-white"
        >
          Add Subject
        </Button>
      </div>

      {/* Semester Filter Tabs (Apple Capsule Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {semesters.map(sem => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-1.5 text-xs rounded-full font-medium whitespace-nowrap transition-all ${
              selectedSemester === sem
                ? 'bg-[#0071E3] text-white shadow-sm font-semibold'
                : 'bg-white/60 dark:bg-white/[0.06] text-muted-foreground hover:text-foreground border border-black/[0.05] dark:border-white/[0.08] backdrop-blur-md'
            }`}
          >
            {sem}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6" />}
          title="No subjects found"
          description="Add your university subjects to organize your classes, notes, and syllabus tracking."
          actionLabel="Add First Subject"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map(subject => {
            const completedCount = subject.syllabusTopics.filter(t => t.completed).length;
            const totalCount = subject.syllabusTopics.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const subNotesCount = notes.filter(n => n.subjectId === subject.id).length;
            const subTasksCount = tasks.filter(t => t.subjectId === subject.id && t.status !== 'completed').length;

            return (
              <div
                key={subject.id}
                onClick={() => setActiveSubject(subject)}
                className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark hover:border-[#0071E3]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subject color bar accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: subject.color }}
                />

                <div className="space-y-3.5 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: `${subject.color}15`,
                          color: subject.color,
                          borderColor: `${subject.color}35`,
                        }}
                      >
                        {subject.code}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground mt-2 group-hover:text-[#0071E3] transition-colors leading-snug">
                        {subject.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                        {subject.description || 'No description provided.'}
                      </p>
                    </div>

                    {subject.targetGrade && (
                      <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-xl bg-white/70 dark:bg-white/[0.08] text-foreground border border-black/[0.06] dark:border-white/[0.1] shrink-0 shadow-2xs">
                        {subject.targetGrade}
                      </span>
                    )}
                  </div>

                  {/* Metadata: Faculty, Room, Credits */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground pt-1">
                    {subject.faculty && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground/70" />
                        {subject.faculty}
                      </span>
                    )}
                    {subject.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground/70" />
                        {subject.room}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3 text-muted-foreground/70" />
                      {subject.credits} Credits
                    </span>
                  </div>
                </div>

                {/* Progress bar and footer */}
                <div className="pt-4 mt-4 border-t border-black/[0.05] dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                      Syllabus Mastery
                    </span>
                    <span className="font-mono font-semibold text-foreground">{progress}%</span>
                  </div>

                  <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: subject.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <span>{subNotesCount} notes • {subTasksCount} open tasks</span>
                    <span className="text-[#0071E3] dark:text-[#38BDF8] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform font-medium">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Subject"
        description="Enter course details to track notes, syllabus, and schedules"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubject} className="space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Code"
                placeholder="e.g. CS 301"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Subject Name"
                placeholder="e.g. Algorithms & Data Structures"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Semester / Term"
              placeholder="e.g. Semester 5 (Fall 2026)"
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Credits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                required
              />
              <Input
                label="Target Grade"
                placeholder="A"
                value={formData.targetGrade}
                onChange={e => setFormData({ ...formData, targetGrade: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Professor / Faculty"
              placeholder="e.g. Prof. David Karger"
              value={formData.faculty}
              onChange={e => setFormData({ ...formData, faculty: e.target.value })}
            />
            <Input
              label="Classroom / Hall"
              placeholder="e.g. Gates Hall 104"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
            />
          </div>

          {/* Color Picker with Apple palette options */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Color Accent</label>
            <div className="flex items-center gap-2">
              {SUBJECT_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formData.color === c.value ? 'scale-125 ring-2 ring-[#0071E3] ring-offset-2 ring-offset-card' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Course Description</label>
            <textarea
              rows={3}
              placeholder="Brief overview of course topics and objectives..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl p-3 outline-none focus:border-[#0071E3] backdrop-blur-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Create Subject</Button>
          </div>
        </form>
      </Modal>

      {/* Subject Detail Drawer / Modal */}
      <SubjectDetailModal
        subject={activeSubject}
        isOpen={!!activeSubject}
        onClose={() => setActiveSubject(null)}
      />
    </div>
  );
};
