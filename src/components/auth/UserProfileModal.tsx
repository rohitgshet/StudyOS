import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { User, Award, Clock } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    university: user?.university || '',
    major: user?.major || '',
    semester: user?.semester || '',
    targetGpa: user?.targetGpa || '',
    studyGoalMinutesPerDay: user?.studyGoalMinutesPerDay || 180,
    avatar: user?.avatar || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    toast.success('Student profile updated successfully');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile & Academic Goals"
      description="Personalize your identity, institution, and study performance targets"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4 p-3.5 bg-white/50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl backdrop-blur-md">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0071E3]/20 to-[#F472B6]/30 border border-white/80 dark:border-white/10 flex items-center justify-center text-[#0071E3] font-bold text-lg overflow-hidden shrink-0 shadow-2xs">
            {formData.avatar ? (
              <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <Input
              label="Avatar Image URL (optional)"
              placeholder="https://..."
              value={formData.avatar}
              onChange={e => setFormData({ ...formData, avatar: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="University / College"
            value={formData.university}
            onChange={e => setFormData({ ...formData, university: e.target.value })}
          />
          <Input
            label="Major / Program"
            value={formData.major}
            onChange={e => setFormData({ ...formData, major: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Current Term / Semester"
            placeholder="e.g. Semester 5 (Fall 2026)"
            value={formData.semester}
            onChange={e => setFormData({ ...formData, semester: e.target.value })}
          />
          <Input
            label="Target GPA"
            placeholder="e.g. 3.90"
            value={formData.targetGpa}
            onChange={e => setFormData({ ...formData, targetGpa: e.target.value })}
            icon={<Award className="w-3.5 h-3.5" />}
          />
        </div>

        <div className="p-3.5 bg-white/40 dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] rounded-2xl space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0071E3]" />
              Daily Focus Target
            </span>
            <span className="font-mono font-bold text-foreground">
              {formData.studyGoalMinutesPerDay} mins ({Math.round(formData.studyGoalMinutesPerDay / 60 * 10) / 10}h)
            </span>
          </label>
          <input
            type="range"
            min="30"
            max="480"
            step="15"
            value={formData.studyGoalMinutesPerDay}
            onChange={e => setFormData({ ...formData, studyGoalMinutesPerDay: Number(e.target.value) })}
            className="w-full accent-[#0071E3] cursor-pointer"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0071E3] hover:bg-[#005BB6] text-white">
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
