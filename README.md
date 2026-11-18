# StudyOS — The Operating System for Students

![StudyOS](https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80)

> A modern, premium, intelligent student productivity platform designed with the design sensibilities of **Linear, Notion, Raycast, and Apple macOS**.

---

## ⚡ Overview

**StudyOS** is not just another note-taking or to-do list app. It is a comprehensive, personal academic operating system that helps students organize, plan, focus, and excel throughout their academic journey.

### 🎯 Key Highlights
- **Command Center Dashboard**: Live timetable display with "Happening Now" indicator, pending assignments countdown, upcoming exams, daily focus goal progress, and streak tracker.
- **My Subjects & Curriculum**: Semester-based subject organization, credit tracking, faculty & room info, syllabus topic checklists, and completion percentages.
- **Smart Notes Workspace**: Notion-like markdown editor with live preview toggle, formatting shortcuts (H1, H2, Code blocks, Math formulas), subject mapping, tagging, and export to `.md`.
- **Weekly Timetable**: Complete weekly academic calendar, class conflict detection, and live indicator highlighting the current or upcoming lecture.
- **Task & Assignment Manager**: Kanban board and List views, priority tagging (Urgent, High, Medium, Low), milestone subtasks checklist, relative countdown badges, and celebratory confetti upon completion.
- **Exam Revision Planner**: Live countdown clocks (Days/Hours), high-yield syllabus topic mastery ratings (*Not Started*, *Reviewing*, *Mastered*), exam weightage calculations, and target score setting.
- **Distraction-Free Focus Mode**: Pomodoro timer (25m / 5m / 15m / 50m Deep Work) with Web Audio API sound synthesizers for bell chimes and ambient soundscapes (Rain, White Noise, Alpha Binaural Waves) — no external streams required.
- **AI Study Assistant**: Intelligent educational tutor featuring 4 modes:
  1. *Concept Explainer* (Analogy, mechanics, and exam trap analysis)
  2. *Interactive Exam Quizzes* (MCQ practice with instant scoring and explanations)
  3. *Smart Flashcard Maker* (Generates cards directly into the Spaced Repetition Review Deck)
  4. *Custom 7-Day Revision Planner*
- **Spaced Repetition Flashcards**: Interactive 3D flip cards with ratings (*Again*, *Hard*, *Good*, *Easy*) and review frequency tracking.
- **Productivity Analytics**: Visual charts for study hours (last 7 days), subject time allocation breakdowns, and GitHub-style 28-day consistency heatmaps.
- **Raycast-Style Command Palette (`⌘K` / `Ctrl+K`)**: Rapid global keyboard search across notes, subjects, tasks, and system views.
- **Cloud Sync & Supabase Ready**: Full PostgreSQL schema with Row-Level Security (RLS) included, ready for Supabase or local offline-first persistent storage.
- **Data Portability**: Instant one-click JSON backup export and restore.
- **Dual Themes**: Hand-crafted deep dark mode and crisp light mode.

---

## 🚀 Quick Start

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React
- **Audio Engine**: Native HTML5 Web Audio API Synthesizer
- **Animations & Effects**: Canvas Confetti & CSS Transitions
- **Database / Cloud**: Offline-first LocalStorage with Supabase PostgreSQL migration schema & Row Level Security (RLS)
