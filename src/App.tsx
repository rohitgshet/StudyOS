import React, { useState } from 'react';
import { ViewType } from './types';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { QuickActionsModal } from './components/dashboard/QuickActionsModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { NotesView } from './components/notes/NotesView';
import { TimetableView } from './components/timetable/TimetableView';
import { TasksView } from './components/tasks/TasksView';
import { ExamPlannerView } from './components/exams/ExamPlannerView';
import { FocusModeView } from './components/focus/FocusModeView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [quickActionsDefaultTab, setQuickActionsDefaultTab] = useState<'task' | 'note' | 'focus'>('task');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();

  const handleOpenQuickActions = (tab: 'task' | 'note' | 'focus' = 'task') => {
    setQuickActionsDefaultTab(tab);
    setIsQuickActionsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          currentView={currentView}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickActions={() => handleOpenQuickActions('task')}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentView}
              onOpenQuickActions={handleOpenQuickActions}
            />
          )}
          {currentView === 'subjects' && <SubjectsView />}
          {currentView === 'notes' && <NotesView />}
          {currentView === 'timetable' && <TimetableView />}
          {currentView === 'tasks' && <TasksView />}
          {currentView === 'exams' && <ExamPlannerView />}
          {currentView === 'focus' && <FocusModeView />}
          {currentView === 'ai' && <AIAssistantView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'settings' && (
            <SettingsView onOpenProfileModal={() => setIsProfileModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
      />

      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        defaultTab={quickActionsDefaultTab}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen || !isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
