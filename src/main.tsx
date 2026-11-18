import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { StudyDataProvider } from './context/StudyDataContext';
import { ToastProvider } from './components/common/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StudyDataProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </StudyDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
