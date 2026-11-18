import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudyData } from '../../context/StudyDataContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../common/Toast';
import { SupabaseService } from '../../lib/supabase';
import { AIService, AIConfig } from '../../lib/ai';
import { AIConfigModal } from '../ai/AIConfigModal';
import {
  Settings,
  User,
  Sun,
  Moon,
  Database,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Key,
} from 'lucide-react';

export const SettingsView: React.FC<{ onOpenProfileModal: () => void }> = ({ onOpenProfileModal }) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { exportData, importData, resetAllData } = useStudyData();
  const toast = useToast();

  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState(() => SupabaseService.getConfig());
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => AIService.getConfig());
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const isAIConfigured = AIService.isConfigured();

  const handleCopySql = () => {
    navigator.clipboard.writeText(SupabaseService.getSqlSchema());
    setCopiedSql(true);
    toast.success('PostgreSQL Schema copied to clipboard');
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportBackup = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported StudyOS backup JSON');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          toast.success('Successfully restored your StudyOS workspace!');
        } else {
          toast.error('Invalid backup file format');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset StudyOS data to initial defaults? All changes will be re-seeded.')) {
      resetAllData();
      toast.info('Workspace reset to defaults');
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    SupabaseService.saveConfig(supabaseConfig);
    toast.success('Saved Supabase configuration');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0071E3]" />
          Settings & Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your personal workspace, appearance, AI models, database sync, and data backups.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0071E3]/20 to-[#F472B6]/30 border border-white/80 dark:border-white/10 flex items-center justify-center text-[#0071E3] font-bold text-lg overflow-hidden shadow-2xs">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{user?.name}</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <p className="text-[11px] text-muted-foreground pt-0.5">{user?.university} • {user?.major}</p>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={onOpenProfileModal}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* 2. Theme & Appearance (Apple Mode Cards) */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Theme & Visual Experience</h3>
        <p className="text-xs text-muted-foreground">
          StudyOS features Apple-style frosted glass with soft creme, light blush pink, and apple blue highlights.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              theme === 'light'
                ? 'border-[#0071E3] bg-[#0071E3]/10 ring-2 ring-[#0071E3]/30'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] hover:bg-white/70'
            }`}
          >
            <Sun className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <p className="text-xs font-semibold text-foreground">Apple Light Mode (Creme & Glass)</p>
              <p className="text-[11px] text-muted-foreground">Silk creme canvas with soft pink & blue glows</p>
            </div>
          </div>

          <div
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
              theme === 'dark'
                ? 'border-[#0071E3] bg-[#0071E3]/15 ring-2 ring-[#0071E3]/30'
                : 'border-black/[0.06] dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.03] hover:bg-white/[0.06]'
            }`}
          >
            <Moon className="w-5 h-5 text-[#38BDF8]" />
            <div>
              <p className="text-xs font-semibold text-foreground">Apple Dark Mode (Obsidian Glass)</p>
              <p className="text-[11px] text-muted-foreground">Deep warm obsidian with frosted materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live AI Model Integration (Gemini / OpenAI) */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F472B6]" />
            <h3 className="text-sm font-semibold text-foreground">Live AI Assistant Engine</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            className="bg-[#0071E3] hover:bg-[#005BB6] text-white"
            icon={<Key className="w-3.5 h-3.5" />}
          >
            Configure AI Key
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Connect your free Google Gemini API key or OpenAI key to activate real AI concept breakdown, live dynamic quizzes, and instant flashcard generation across all your registered subjects.
        </p>

        <div className="p-4 bg-white/50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isAIConfigured ? 'bg-[#10B981] animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-foreground capitalize">
                {aiConfig.provider === 'gemini' ? 'Google Gemini' : aiConfig.provider === 'openai' ? 'OpenAI' : 'Custom LLM'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-muted-foreground">
                {aiConfig.model}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isAIConfigured
                ? 'Your API key is stored safely in your browser localStorage.'
                : 'No API key configured yet. Click Configure AI Key to connect Google Gemini (free) or OpenAI.'}
            </p>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#0071E3] dark:text-[#38BDF8] hover:underline font-medium shrink-0 self-start sm:self-center"
          >
            <span>Get Free Gemini Key</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4. Cloud Database & Supabase Integration */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0071E3]" />
            <h3 className="text-sm font-semibold text-foreground">Cloud Sync & Supabase Integration</h3>
          </div>
          <Button size="sm" variant="outline" icon={copiedSql ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />} onClick={handleCopySql}>
            Copy SQL Schema
          </Button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          StudyOS is architected to seamlessly pair with your private Supabase PostgreSQL database. Paste your project credentials below to enable multi-device cloud synchronization.
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Supabase Project URL"
              placeholder="https://xyz.supabase.co"
              value={supabaseConfig.url}
              onChange={e => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
            />
            <Input
              label="Supabase Anon Public Key"
              placeholder="eyJhbGciOi..."
              value={supabaseConfig.anonKey}
              onChange={e => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="supabase-enabled"
                checked={supabaseConfig.enabled}
                onChange={e => setSupabaseConfig({ ...supabaseConfig, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#0071E3] accent-[#0071E3]"
              />
              <label htmlFor="supabase-enabled" className="text-xs text-foreground cursor-pointer">
                Enable cloud sync for this browser session
              </label>
            </div>

            <Button type="submit" size="sm" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">
              Save Credentials
            </Button>
          </div>
        </form>
      </div>

      {/* 5. Data Backup, Export & Reset */}
      <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Data Portability & Backups</h3>
        <p className="text-xs text-muted-foreground">
          Your data is 100% private to your browser. You can export a snapshot anytime or restore from an existing JSON backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportBackup}>
            Export Data (.json)
          </Button>

          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            <div className="inline-flex items-center justify-center font-medium bg-white/60 dark:bg-white/[0.08] text-foreground hover:bg-white/90 dark:hover:bg-white/[0.12] text-sm px-4 py-2 rounded-xl gap-2 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-2xs">
              <Upload className="w-4 h-4" />
              Import Data (.json)
            </div>
          </label>

          <Button variant="danger" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={handleReset} className="ml-auto">
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* AI Config Modal */}
      <AIConfigModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSaved={newConfig => setAiConfig(newConfig)}
      />
    </div>
  );
};
