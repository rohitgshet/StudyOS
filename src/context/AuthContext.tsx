import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { INITIAL_DATA, StorageService } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; university?: string; major?: string }) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'studyos_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Auto-seed with default user profile for instant smooth UX
        const initial = StorageService.loadData().profile;
        setUser(initial);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(initial));
      }
    } catch {
      setUser(INITIAL_DATA.profile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate auth network latency for realistic feel
    await new Promise(r => setTimeout(r, 400));
    const data = StorageService.loadData();
    const updatedUser = {
      ...data.profile,
      email: email || data.profile.email,
    };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (formData: { name: string; email: string; university?: string; major?: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450));
    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: formData.name,
      email: formData.email,
      university: formData.university || 'Tech University',
      major: formData.major || 'Computer Science',
      semester: 'Semester 1 (Fall 2026)',
      targetGpa: '4.0',
      studyGoalMinutesPerDay: 180,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    // Update stored profile
    const currentData = StorageService.loadData();
    StorageService.saveData({ ...currentData, profile: newUser });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const forgotPassword = async (_email: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 300));
    return true;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    const currentData = StorageService.loadData();
    StorageService.saveData({ ...currentData, profile: updated });
  };

  const loginAsDemo = () => {
    const demo = INITIAL_DATA.profile;
    setUser(demo);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demo));
    const currentData = StorageService.loadData();
    StorageService.saveData({ ...currentData, profile: demo });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword,
        updateProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
