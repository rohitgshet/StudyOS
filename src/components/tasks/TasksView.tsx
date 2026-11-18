import React, { useState, useMemo } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { Task, Priority, TaskCategory, TaskStatus } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../common/Toast';
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
} from 'lucide-react';
import { formatDate, getRelativeTimeString, generateId } from '../../lib/utils';

export const TasksView: React.FC = () => {
  const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskStatus, toggleSubtask } = useStudyData();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // New task form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: subjects[0]?.id || '',
    category: 'assignment' as TaskCategory,
    priority: 'medium' as Priority,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedMinutes: 60,
    subtasks: [] as { id: string; title: string; completed: boolean }[],
  });

  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSubject = filterSubject === 'All' || t.subjectId === filterSubject;
      const matchCategory = filterCategory === 'All' || t.category === filterCategory;
      const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
      return matchSubject && matchCategory && matchPriority;
    });
  }, [tasks, filterSubject, filterCategory, filterPriority]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addTask({
      ...formData,
      status: 'todo',
    });

    toast.success('Task created successfully');
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      description: '',
      subjectId: subjects[0]?.id || '',
      category: 'assignment',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      estimatedMinutes: 60,
      subtasks: [],
    });
  };

  const handleAddSubtaskToForm = () => {
    if (!newSubtaskInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: 'st_' + generateId(), title: newSubtaskInput.trim(), completed: false },
      ],
    }));
    setNewSubtaskInput('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(id);
      toast.info('Task deleted');
      if (activeTask?.id === id) setActiveTask(null);
    }
  };

  const priorityColors: Record<Priority, { label: string; badge: 'danger' | 'warning' | 'primary' | 'default' }> = {
    urgent: { label: 'Urgent', badge: 'danger' },
    high: { label: 'High', badge: 'warning' },
    medium: { label: 'Medium', badge: 'primary' },
    low: { label: 'Low', badge: 'default' },
  };

  const columns: { id: TaskStatus; label: string; count: number }[] = [
    { id: 'todo', label: 'To Do', count: filteredTasks.filter(t => t.status === 'todo').length },
    { id: 'in_progress', label: 'In Progress', count: filteredTasks.filter(t => t.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: filteredTasks.filter(t => t.status === 'completed').length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#0071E3]" />
            Task Manager & Deadlines
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage assignments, homework, and study deadlines with priority tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View mode toggle (Apple Capsule) */}
          <div className="flex items-center bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] p-1 rounded-2xl backdrop-blur-md shadow-2xs">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'board' ? 'bg-[#0071E3] text-white shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-[#0071E3] text-white shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0071E3] hover:bg-[#005BB6] text-white shadow-sm"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Bar (Apple Frosted Capsule) */}
      <div className="flex flex-wrap items-center gap-2.5 apple-glass p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.08] text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
          <Tag className="w-3.5 h-3.5 text-[#F472B6]" />
          <span className="font-medium">Filters:</span>
        </div>

        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="bg-white/70 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1.5 text-foreground outline-none shadow-2xs"
        >
          <option value="All">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.code}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-white/70 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1.5 text-foreground outline-none shadow-2xs"
        >
          <option value="All">All Categories</option>
          <option value="assignment">Assignments</option>
          <option value="homework">Homework</option>
          <option value="project">Projects</option>
          <option value="study">Study</option>
          <option value="reading">Reading</option>
        </select>

        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="bg-white/70 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1.5 text-foreground outline-none shadow-2xs"
        >
          <option value="All">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {(filterSubject !== 'All' || filterCategory !== 'All' || filterPriority !== 'All') && (
          <button
            onClick={() => {
              setFilterSubject('All');
              setFilterCategory('All');
              setFilterPriority('All');
            }}
            className="text-[#0071E3] dark:text-[#38BDF8] hover:underline text-xs ml-auto font-medium"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);

            return (
              <div key={col.id} className="apple-glass-card rounded-3xl p-5 flex flex-col min-h-[500px] shadow-apple-glass dark:shadow-apple-glass-dark">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-black/[0.05] dark:border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {col.label}
                    </span>
                    <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-muted-foreground">
                      {col.count}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, status: col.id }));
                      setIsAddModalOpen(true);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3">
                  {colTasks.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-center p-4 border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl text-xs text-muted-foreground">
                      No tasks in this stage
                    </div>
                  ) : (
                    colTasks.map(task => {
                      const subject = subjects.find(s => s.id === task.subjectId);
                      const completedSubtasks = task.subtasks.filter(st => st.completed).length;

                      return (
                        <div
                          key={task.id}
                          className="apple-glass border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071E3]/40 p-4 rounded-2xl shadow-2xs transition-all space-y-2.5 group cursor-pointer"
                          onClick={() => setActiveTask(task)}
                        >
                          {/* Subject Pill & Priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                backgroundColor: `${subject?.color || '#0071E3'}15`,
                                color: subject?.color || '#0071E3',
                                borderColor: `${subject?.color || '#0071E3'}30`,
                              }}
                            >
                              {subject?.code || 'GENERAL'}
                            </span>

                            <Badge variant={priorityColors[task.priority].badge} size="sm">
                              {priorityColors[task.priority].label}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-semibold text-foreground group-hover:text-[#0071E3] transition-colors leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-[11px] text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {task.subtasks.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Subtasks</span>
                                <span className="font-mono">{completedSubtasks}/{task.subtasks.length}</span>
                              </div>
                              <div className="w-full bg-black/[0.05] dark:bg-white/[0.08] rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-[#10B981] to-[#38BDF8] h-full rounded-full"
                                  style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer: Due date & status toggle */}
                          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground/70" />
                              {getRelativeTimeString(task.dueDate)}
                            </span>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
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
      ) : (
        /* List View */
        <div className="apple-glass-card rounded-3xl overflow-hidden shadow-apple-glass dark:shadow-apple-glass-dark">
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No tasks match current filters.
              </div>
            ) : (
              filteredTasks.map(task => {
                const subject = subjects.find(s => s.id === task.subjectId);
                const isCompleted = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-white/40 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id);
                        }}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={priorityColors[task.priority].badge} size="sm">
                        {priorityColors[task.priority].label}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Academic Task"
        description="Set assignment deadlines, priority, and subtask milestones"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-3.5">
          <Input
            label="Task Title"
            placeholder="e.g. Implement Ford-Fulkerson algorithm"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
          />

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description / Spec</label>
            <textarea
              rows={2}
              placeholder="Instructions, requirements or links..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl p-3 outline-none focus:border-[#0071E3] backdrop-blur-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <select
                value={formData.subjectId}
                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
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
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
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
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3] backdrop-blur-md"
              >
                <option value="assignment">Assignment</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="study">Study</option>
                <option value="reading">Reading</option>
              </select>
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="space-y-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
            <label className="block text-xs font-medium text-muted-foreground">Subtasks Checklist</label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {formData.subtasks.map(st => (
                <div key={st.id} className="flex items-center justify-between text-xs p-2 bg-white/60 dark:bg-white/[0.04] border border-black/[0.05] rounded-xl">
                  <span>{st.title}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.filter(s => s.id !== st.id),
                      }))
                    }
                    className="text-muted-foreground hover:text-[#FB7185] font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add subtask milestone..."
                value={newSubtaskInput}
                onChange={e => setNewSubtaskInput(e.target.value)}
                className="text-xs py-1"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtaskToForm();
                  }
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtaskToForm}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Task Details / Edit Modal */}
      {activeTask && (
        <Modal
          isOpen={!!activeTask}
          onClose={() => setActiveTask(null)}
          title={activeTask.title}
          description={`Due: ${formatDate(activeTask.dueDate)} • ${activeTask.category}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {activeTask.description && (
              <p className="text-xs text-foreground bg-white/60 dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                {activeTask.description}
              </p>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Subtasks Checklist</h4>
              <div className="space-y-1.5">
                {activeTask.subtasks.map(st => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(activeTask.id, st.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      st.completed
                        ? 'border-[#10B981]/20 bg-[#10B981]/8 line-through text-muted-foreground'
                        : 'border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] text-foreground'
                    }`}
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>{st.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDelete(activeTask.id)}
              >
                Delete
              </Button>

              <Button
                variant={activeTask.status === 'completed' ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  toggleTaskStatus(activeTask.id);
                  setActiveTask(null);
                }}
              >
                {activeTask.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
