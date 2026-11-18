import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Note, TimetableClass, Task, Exam, FocusSession, Flashcard, TaskStatus } from '../types';
import { StorageService, StudyOSData } from '../lib/storage';
import { generateId } from '../lib/utils';
import confetti from 'canvas-confetti';

interface StudyDataContextType {
  data: StudyOSData;
  subjects: Subject[];
  notes: Note[];
  timetable: TimetableClass[];
  tasks: Task[];
  exams: Exam[];
  focusSessions: FocusSession[];
  flashcards: Flashcard[];
  
  // Subjects
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  toggleSyllabusTopic: (subjectId: string, topicId: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Timetable
  addClass: (cls: Omit<TimetableClass, 'id'>) => TimetableClass;
  updateClass: (id: string, updates: Partial<TimetableClass>) => void;
  deleteClass: (id: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  // Exams
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  updateExamTopicStatus: (examId: string, topicId: string, status: 'not_started' | 'reviewing' | 'mastered') => void;

  // Focus
  logFocusSession: (session: Omit<FocusSession, 'id' | 'completedAt'>) => void;

  // Flashcards
  addFlashcard: (fc: Omit<Flashcard, 'id' | 'reviewCount'>) => Flashcard;
  updateFlashcardMastery: (id: string, mastery: Flashcard['mastery']) => void;
  deleteFlashcard: (id: string) => void;

  // System
  resetAllData: () => void;
  importData: (json: string) => boolean;
  exportData: () => string;
}

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export const StudyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<StudyOSData>(() => StorageService.loadData());

  useEffect(() => {
    StorageService.saveData(data);
  }, [data]);

  // Subjects CRUD
  const addSubject = (newSub: Omit<Subject, 'id' | 'createdAt'>): Subject => {
    const subject: Subject = {
      ...newSub,
      id: 'sub_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, subjects: [subject, ...prev.subjects] }));
    return subject;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      notes: prev.notes.map(n => (n.subjectId === id ? { ...n, subjectId: undefined } : n)),
      tasks: prev.tasks.map(t => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
      timetable: prev.timetable.filter(tt => tt.subjectId !== id),
      exams: prev.exams.filter(e => e.subjectId !== id),
    }));
  };

  const toggleSyllabusTopic = (subjectId: string, topicId: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          syllabusTopics: s.syllabusTopics.map(t => (t.id === topicId ? { ...t, completed: !t.completed } : t)),
        };
      }),
    }));
  };

  // Notes CRUD
  const addNote = (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const now = new Date().toISOString();
    const note: Note = {
      ...newNote,
      id: 'note_' + generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setData(prev => ({ ...prev, notes: [note, ...prev.notes] }));
    return note;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }));
  };

  const deleteNote = (id: string) => {
    setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
  };

  const togglePinNote = (id: string) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  // Timetable CRUD
  const addClass = (cls: Omit<TimetableClass, 'id'>): TimetableClass => {
    const item: TimetableClass = { ...cls, id: 'tt_' + generateId() };
    setData(prev => ({ ...prev, timetable: [...prev.timetable, item] }));
    return item;
  };

  const updateClass = (id: string, updates: Partial<TimetableClass>) => {
    setData(prev => ({
      ...prev,
      timetable: prev.timetable.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteClass = (id: string) => {
    setData(prev => ({ ...prev, timetable: prev.timetable.filter(c => c.id !== id) }));
  };

  // Tasks CRUD
  const addTask = (t: Omit<Task, 'id' | 'createdAt'>): Task => {
    const task: Task = {
      ...t,
      id: 'task_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    return task;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const toggleTaskStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
        if (nextStatus === 'completed') {
          // Trigger confetti celebration!
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9'],
            });
          } catch {}
        }
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
          subtasks: t.subtasks.map(st => ({
            ...st,
            completed: nextStatus === 'completed' ? true : st.completed,
          })),
        };
      }),
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        return {
          ...t,
          subtasks: updatedSubtasks,
          status: allCompleted ? 'completed' : t.status,
          completedAt: allCompleted ? new Date().toISOString() : t.completedAt,
        };
      }),
    }));
  };

  // Exams CRUD
  const addExam = (e: Omit<Exam, 'id' | 'createdAt'>): Exam => {
    const exam: Exam = {
      ...e,
      id: 'exam_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, exams: [...prev.exams, exam] }));
    return exam;
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setData(prev => ({
      ...prev,
      exams: prev.exams.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteExam = (id: string) => {
    setData(prev => ({ ...prev, exams: prev.exams.filter(e => e.id !== id) }));
  };

  const updateExamTopicStatus = (
    examId: string,
    topicId: string,
    status: 'not_started' | 'reviewing' | 'mastered'
  ) => {
    setData(prev => ({
      ...prev,
      exams: prev.exams.map(e => {
        if (e.id !== examId) return e;
        return {
          ...e,
          topics: e.topics.map(t => (t.id === topicId ? { ...t, status } : t)),
        };
      }),
    }));
  };

  // Focus Session logging
  const logFocusSession = (session: Omit<FocusSession, 'id' | 'completedAt'>) => {
    const newSession: FocusSession = {
      ...session,
      id: 'fs_' + generateId(),
      completedAt: new Date().toISOString(),
    };

    setData(prev => {
      // Check streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = prev.profile.lastActiveDate;
      let newStreak = prev.profile.streak;

      if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (lastActive === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        focusSessions: [newSession, ...prev.focusSessions],
        profile: {
          ...prev.profile,
          streak: newStreak,
          lastActiveDate: today,
        },
      };
    });
  };

  // Flashcards CRUD
  const addFlashcard = (fc: Omit<Flashcard, 'id' | 'reviewCount'>): Flashcard => {
    const card: Flashcard = {
      ...fc,
      id: 'fc_' + generateId(),
      reviewCount: 0,
    };
    setData(prev => ({ ...prev, flashcards: [card, ...prev.flashcards] }));
    return card;
  };

  const updateFlashcardMastery = (id: string, mastery: Flashcard['mastery']) => {
    setData(prev => ({
      ...prev,
      flashcards: prev.flashcards.map(c =>
        c.id === id
          ? {
              ...c,
              mastery,
              reviewCount: c.reviewCount + 1,
              lastReviewed: new Date().toISOString(),
            }
          : c
      ),
    }));
  };

  const deleteFlashcard = (id: string) => {
    setData(prev => ({ ...prev, flashcards: prev.flashcards.filter(c => c.id !== id) }));
  };

  const resetAllData = () => {
    const res = StorageService.resetToDefault();
    setData(res);
  };

  const importData = (json: string): boolean => {
    const success = StorageService.importFromJson(json);
    if (success) {
      setData(StorageService.loadData());
    }
    return success;
  };

  const exportData = (): string => {
    return StorageService.exportToJson();
  };

  return (
    <StudyDataContext.Provider
      value={{
        data,
        subjects: data.subjects,
        notes: data.notes,
        timetable: data.timetable,
        tasks: data.tasks,
        exams: data.exams,
        focusSessions: data.focusSessions,
        flashcards: data.flashcards,

        addSubject,
        updateSubject,
        deleteSubject,
        toggleSyllabusTopic,

        addNote,
        updateNote,
        deleteNote,
        togglePinNote,

        addClass,
        updateClass,
        deleteClass,

        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,

        addExam,
        updateExam,
        deleteExam,
        updateExamTopicStatus,

        logFocusSession,

        addFlashcard,
        updateFlashcardMastery,
        deleteFlashcard,

        resetAllData,
        importData,
        exportData,
      }}
    >
      {children}
    </StudyDataContext.Provider>
  );
};

export const useStudyData = () => {
  const context = useContext(StudyDataContext);
  if (!context) throw new Error('useStudyData must be used within StudyDataProvider');
  return context;
};
