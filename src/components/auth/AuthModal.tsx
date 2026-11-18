import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, forgotPassword, loginAsDemo, isLoading } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    if (mode === 'login') {
      await login(formData.email, formData.password);
      toast.success('Welcome back to StudyOS!');
      onClose();
    } else if (mode === 'signup') {
      if (!formData.name) {
        toast.error('Please enter your full name');
        return;
      }
      await signup(formData);
      toast.success('Your student workspace is ready!');
      onClose();
    } else if (mode === 'forgot') {
      await forgotPassword(formData.email);
      toast.info('Password reset instructions sent to your email');
      setMode('login');
    }
  };

  const handleDemo = () => {
    loginAsDemo();
    toast.success('Loaded student demo workspace');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? 'Sign in to StudyOS'
          : mode === 'signup'
          ? 'Create Student Workspace'
          : 'Reset Your Password'
      }
      description={
        mode === 'login'
          ? 'Enter your academic credentials to access your operating system'
          : mode === 'signup'
          ? 'Join StudyOS to organize your entire academic life'
          : 'We will send a secure reset link to your email address'
      }
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <Input
            label="Full Name"
            placeholder="e.g. Alex Rivera"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        )}

        <Input
          label="Student Email"
          type="email"
          placeholder="e.g. student@stanford.edu"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />

        {mode !== 'forgot' && (
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            required
          />
        )}

        {mode === 'signup' && (
          <>
            <Input
              label="University / Institution"
              placeholder="e.g. Stanford University"
              value={formData.university}
              onChange={e => setFormData({ ...formData, university: e.target.value })}
            />
            <Input
              label="Major / Field of Study"
              placeholder="e.g. Computer Science"
              value={formData.major}
              onChange={e => setFormData({ ...formData, major: e.target.value })}
            />
          </>
        )}

        <div className="pt-2 space-y-2">
          <Button type="submit" className="w-full bg-[#0071E3] hover:bg-[#005BB6] text-white rounded-xl shadow-sm" disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Create Workspace'
              : 'Send Reset Link'}
          </Button>

          {mode === 'login' && (
            <Button
              type="button"
              variant="outline"
              className="w-full text-xs gap-1.5 rounded-xl"
              onClick={handleDemo}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
              Quick Demo Account (Pre-populated)
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-black/[0.05] dark:border-white/[0.08]">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="hover:text-foreground transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#0071E3] hover:underline font-medium"
              >
                Create account
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-[#0071E3] hover:underline font-medium mx-auto"
            >
              Back to Sign In
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Private & encrypted student workspace</span>
        </div>
      </form>
    </Modal>
  );
};
