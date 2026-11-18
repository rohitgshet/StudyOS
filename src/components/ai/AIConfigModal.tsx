import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AIService, AIConfig, AIProvider } from '../../lib/ai';
import { useToast } from '../common/Toast';
import { Key, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff, Bot } from 'lucide-react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (config: AIConfig) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const toast = useToast();
  const [config, setConfig] = useState<AIConfig>(() => AIService.getConfig());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; updatedModel?: string } | null>(null);
  const [availableGeminiModels, setAvailableGeminiModels] = useState<{ name: string; version: 'v1' | 'v1beta' }[]>([]);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      const current = AIService.getConfig();
      setConfig(current);
      setTestResult(null);

      if (current.provider === 'gemini' && current.apiKey.trim().length > 5) {
        AIService.fetchAvailableGeminiModels(current.apiKey).then(models => {
          if (models.length > 0) setAvailableGeminiModels(models);
        });
      }
    }
  }, [isOpen]);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await AIService.testConnection(config);
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      if (result.updatedModel && result.updatedModel !== config.model) {
        setConfig(prev => ({ ...prev, model: result.updatedModel! }));
      }
      toast.success('Live AI connection verified!');
    } else {
      toast.error('Connection test failed: ' + result.message);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AIService.saveConfig(config);
    toast.success('Saved live AI configuration');
    onSaved(config);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Live Academic AI"
      description="Power your StudyOS Assistant with real Google Gemini or OpenAI language models"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Provider Selector (Apple Capsule Buttons) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            AI Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  provider: 'gemini',
                  model: config.model.includes('gemini') ? config.model : 'gemini-1.5-flash',
                  apiVersion: 'v1',
                })
              }
              className={`p-3 rounded-2xl border text-left transition-all ${
                config.provider === 'gemini'
                  ? 'border-[#0071E3] bg-[#0071E3]/12 text-[#0071E3] dark:text-[#38BDF8] ring-2 ring-[#0071E3]/20 font-semibold'
                  : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-foreground hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="text-xs">Google Gemini</span>
              </div>
              <span className="text-[10px] text-[#059669] dark:text-[#34D399] font-medium block">
                Free Tier Available
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  provider: 'openai',
                  model: config.model.includes('gpt') ? config.model : 'gpt-4o-mini',
                })
              }
              className={`p-3 rounded-2xl border text-left transition-all ${
                config.provider === 'openai'
                  ? 'border-[#0071E3] bg-[#0071E3]/12 text-[#0071E3] dark:text-[#38BDF8] ring-2 ring-[#0071E3]/20 font-semibold'
                  : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-foreground hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Bot className="w-3.5 h-3.5 text-[#F472B6]" />
                <span className="text-xs">OpenAI</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                GPT-4o / Mini
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setConfig({
                  ...config,
                  provider: 'custom',
                  customBaseUrl: config.customBaseUrl || 'https://openrouter.ai/api/v1',
                })
              }
              className={`p-3 rounded-2xl border text-left transition-all ${
                config.provider === 'custom'
                  ? 'border-[#0071E3] bg-[#0071E3]/12 text-[#0071E3] dark:text-[#38BDF8] ring-2 ring-[#0071E3]/20 font-semibold'
                  : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] text-foreground hover:bg-white/80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Key className="w-3.5 h-3.5 text-[#DEC5A6]" />
                <span className="text-xs">Custom / Local</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">
                Ollama, Groq, etc.
              </span>
            </button>
          </div>
        </div>

        {/* Free Gemini API key helper banner */}
        {config.provider === 'gemini' && (
          <div className="p-3 bg-[#0071E3]/10 dark:bg-[#0071E3]/15 border border-[#0071E3]/20 rounded-2xl flex items-center justify-between text-xs text-foreground">
            <div>
              <p className="font-semibold text-[#0071E3] dark:text-[#38BDF8]">Need a free Google Gemini key?</p>
              <p className="text-[11px] text-muted-foreground">Takes 10 seconds to generate with your Google account.</p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0071E3] text-white font-medium text-xs shadow-2xs hover:bg-[#005BB6] shrink-0"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground">
            {config.provider === 'gemini' ? 'Gemini API Key' : config.provider === 'openai' ? 'OpenAI API Key' : 'API Key'}
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder={config.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={config.apiKey}
              onChange={e => {
                const newKey = e.target.value;
                setConfig({ ...config, apiKey: newKey });
                setTestResult(null);
                if (config.provider === 'gemini' && newKey.trim().length > 10) {
                  AIService.fetchAvailableGeminiModels(newKey).then(models => {
                    if (models.length > 0) setAvailableGeminiModels(models);
                  });
                }
              }}
              required
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-sm rounded-xl pl-3.5 pr-10 py-2 outline-none focus:border-[#0071E3] font-mono backdrop-blur-md"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 text-muted-foreground hover:text-foreground p-0.5"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-muted-foreground">Model</label>
          {config.provider === 'gemini' ? (
            <select
              value={config.model}
              onChange={e => {
                const selected = e.target.value;
                const match = availableGeminiModels.find(m => m.name === selected);
                setConfig({
                  ...config,
                  model: selected,
                  apiVersion: match ? match.version : selected.includes('2.0') || selected.includes('2.5') ? 'v1beta' : 'v1',
                });
              }}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3]"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: Google Flagship)</option>
              <option value="gemini-3.7-flash">gemini-3.7-flash</option>
              <option value="gemma-4-31b-it">gemma-4-31b-it (Auto-detected on your key)</option>
              <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
              {availableGeminiModels
                .filter(m => !['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(m.name))
                .map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.version})
                  </option>
                ))}
            </select>
          ) : config.provider === 'openai' ? (
            <select
              value={config.model}
              onChange={e => setConfig({ ...config, model: e.target.value })}
              className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground text-xs rounded-xl px-3 py-2 outline-none focus:border-[#0071E3]"
            >
              <option value="gpt-4o-mini">gpt-4o-mini (Recommended: Fast & Affordable)</option>
              <option value="gpt-4o">gpt-4o (Full flagship capabilities)</option>
            </select>
          ) : (
            <div className="space-y-2">
              <Input
                label="Custom Base URL"
                placeholder="https://openrouter.ai/api/v1 or http://localhost:11434/v1"
                value={config.customBaseUrl || ''}
                onChange={e => setConfig({ ...config, customBaseUrl: e.target.value })}
              />
              <Input
                label="Model Identifier"
                placeholder="e.g. meta-llama/llama-3.2-3b-instruct"
                value={config.model}
                onChange={e => setConfig({ ...config, model: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Live Test Connection status */}
        {testResult && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-[#10B981]/12 border-[#10B981]/30 text-[#059669] dark:text-[#34D399]'
                : 'bg-[#FB7185]/15 border-[#FB7185]/30 text-[#E11D48] dark:text-[#FDA4AF]'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium truncate">{testResult.message}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={isTesting || !config.apiKey.trim()}
          >
            {isTesting ? 'Verifying...' : 'Test Connection'}
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">
              Save & Connect
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
