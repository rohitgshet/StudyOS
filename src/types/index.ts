export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskCategory = 'assignment' | 'homework' | 'project' | 'study' | 'reading';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  university?: string;
  major?: string;
  semester?: string;
  targetGpa?: string;
  studyGoalMinutesPerDay: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Algorithms & Data Structures"
  color: string; // Hex color or Tailwind accent
  semester: string; // e.g. "Semester 5" or "Fall 2026"
  faculty?: string;
  room?: string;
  credits: number;
  description?: string;
  syllabusTopics: SyllabusTopic[];
  targetGrade?: string;
  createdAt: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown formatted
  subjectId?: string;
  tags: string[];
  pinned: boolean;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableClass {
  id: string;
  subjectId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm (e.g. "09:00")
  endTime: string;   // HH:mm (e.g. "10:30")
  room: string;
  faculty: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD or ISO
  estimatedMinutes?: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  completedAt?: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string; // e.g. "Midterm Examination"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  room?: string;
  weightagePercent?: number;
  topics: { id: string; name: string; status: 'not_started' | 'reviewing' | 'mastered' }[];
  notes?: string;
  targetScore?: number;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  durationMinutes: number;
  type: 'pomodoro' | 'short_break' | 'long_break' | 'custom';
  subjectId?: string;
  taskId?: string;
  notes?: string;
  completedAt: string; // ISO
}

export interface Flashcard {
  id: string;
  subjectId?: string;
  front: string;
  back: string;
  mastery: 'again' | 'hard' | 'good' | 'easy';
  reviewCount: number;
  lastReviewed?: string;
}

export interface AIConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'explanation' | 'quiz' | 'plan' | 'flashcards';
  quizData?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export type ViewType = 
  | 'dashboard'
  | 'subjects'
  | 'notes'
  | 'timetable'
  | 'tasks'
  | 'exams'
  | 'focus'
  | 'ai'
  | 'analytics'
  | 'settings';
