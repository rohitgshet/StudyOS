import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useStudyData } from '../../context/StudyDataContext';
import { useToast } from '../common/Toast';
import { FileText, CheckSquare, Timer, Sparkles } from 'lucide-react';
import { Priority, TaskCategory } from '../../types';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'note' | 'focus';
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'task',
}) => {
  const [tab, setTab] = useState<'task' | 'note' | 'focus'>(defaultTab);
  const { subjects, addTask, addNote, logFocusSession } = useStudyData();
  const toast = useToast();

  const [taskData, setTaskData] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    priority: 'medium' as Priority,
    category: 'assignment' as TaskCategory,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedMinutes: 60,
  });

  const [noteData, setNoteData] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    content: '',
    tags: 'QuickNote',
  });

  const [focusData, setFocusData] = useState({
    durationMinutes: 45,
    subjectId: subjects[0]?.id || '',
    notes: '',
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    addTask({
      ...taskData,
      status: 'todo',
      subtasks: [],
    });
    toast.success('Task created successfully');
    onClose();
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteData.title.trim()) return;
    addNote({
      title: noteData.title,
      content: noteData.content,
      subjectId: noteData.subjectId || undefined,
      tags: noteData.tags.split(',').map(t => t.trim()).filter(Boolean),
      pinned: false,
      folder: 'Quick Notes',
    });
    toast.success('Note saved to workspace');
    onClose();
  };

  const handleLogFocus = (e: React.FormEvent) => {
    e.preventDefault();
    logFocusSession({
      durationMinutes: Number(focusData.durationMinutes),
      type: 'custom',
      subjectId: focusData.subjectId || undefined,
      notes: focusData.notes,
    });
    toast.success(`Logged ${focusData.durationMinutes}m focus session!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Action"
      description="Quickly capture a task, save a study note, or log study time"
      maxWidth="md"
    >
      {/* Apple Capsule Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white/60 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-full mb-4 backdrop-blur-md">
        <button
          onClick={() => setTab('task')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
            tab === 'task'
              ? 'bg-[#0071E3] text-white shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          New Task
        </button>
        <button
          onClick={() => setTab('note')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
            tab === 'note'
              ? 'bg-[#F472B6] text-white shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Quick Note
        </button>
        <button
          onClick={() => setTab('focus')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
            tab === 'focus'
              ? 'bg-[#10B981] text-white shadow-2xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          Log Study
        </button>
      </div>

      {tab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <Input
            label="Task / Assignment Title"
            placeholder="e.g. Finish Problem Set 3"
            value={taskData.title}
            onChange={e => setTaskData({ ...taskData, title: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <select
                value={taskData.subjectId}
                onChange={e => setTaskData({ ...taskData, subjectId: e.target.value })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none backdrop-blur-md"
              >
                <option value="">No Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
              <select
                value={taskData.priority}
                onChange={e => setTaskData({ ...taskData, priority: e.target.value as Priority })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none backdrop-blur-md"
              >
                <option value="urgent">Urgent (P1)</option>
                <option value="high">High (P2)</option>
                <option value="medium">Medium (P3)</option>
                <option value="low">Low (P4)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={taskData.dueDate}
              onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={taskData.category}
                onChange={e => setTaskData({ ...taskData, category: e.target.value as TaskCategory })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none backdrop-blur-md"
              >
                <option value="assignment">Assignment</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="study">Study</option>
                <option value="reading">Reading</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Create Task</Button>
          </div>
        </form>
      )}

      {tab === 'note' && (
        <form onSubmit={handleCreateNote} className="space-y-3.5">
          <Input
            label="Note Title"
            placeholder="e.g. Key Takeaways from Lecture 7"
            value={noteData.title}
            onChange={e => setNoteData({ ...noteData, title: e.target.value })}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <select
                value={noteData.subjectId}
                onChange={e => setNoteData({ ...noteData, subjectId: e.target.value })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none backdrop-blur-md"
              >
                <option value="">General (No Subject)</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
            <Input
              label="Tags (comma separated)"
              placeholder="Lecture, Exam, Key"
              value={noteData.tags}
              onChange={e => setNoteData({ ...noteData, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Content (Markdown)</label>
            <textarea
              rows={4}
              placeholder="Write your note in markdown..."
              value={noteData.content}
              onChange={e => setNoteData({ ...noteData, content: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl p-3 outline-none focus:border-[#0071E3] font-mono backdrop-blur-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Save Note</Button>
          </div>
        </form>
      )}

      {tab === 'focus' && (
        <form onSubmit={handleLogFocus} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              min="5"
              max="360"
              value={focusData.durationMinutes}
              onChange={e => setFocusData({ ...focusData, durationMinutes: Number(e.target.value) })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <select
                value={focusData.subjectId}
                onChange={e => setFocusData({ ...focusData, subjectId: e.target.value })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none backdrop-blur-md"
              >
                <option value="">General Study</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Session Summary</label>
            <textarea
              rows={3}
              placeholder="e.g. Read chapter 4 on B-Trees and practiced exercises..."
              value={focusData.notes}
              onChange={e => setFocusData({ ...focusData, notes: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl p-3 outline-none focus:border-[#0071E3] backdrop-blur-md"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" icon={<Sparkles className="w-3.5 h-3.5" />} className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Log Session</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
