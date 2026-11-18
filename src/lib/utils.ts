import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const m = minutes || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedH = h % 12 || 12;
  return `${formattedH}:${m} ${ampm}`;
}

export function getDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRelativeTimeString(dateStr: string): string {
  const days = getDaysRemaining(dateStr);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  return formatDate(dateStr);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Apple refined palette: Light Pink, Apple Blue, Creme Sand, Soft Mint, Coral, Soft Amber
export const SUBJECT_COLORS = [
  { name: 'Apple Blue', value: '#0071E3', bg: 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20' },
  { name: 'Light Blush Pink', value: '#F472B6', bg: 'bg-[#F472B6]/15 text-[#DB2777] border-[#F472B6]/30' },
  { name: 'Warm Creme', value: '#DEC5A6', bg: 'bg-[#DEC5A6]/20 text-[#854D0E] border-[#DEC5A6]/40' },
  { name: 'Soft Emerald', value: '#10B981', bg: 'bg-[#10B981]/15 text-[#059669] border-[#10B981]/30' },
  { name: 'Apple Coral', value: '#FB7185', bg: 'bg-[#FB7185]/15 text-[#E11D48] border-[#FB7185]/30' },
  { name: 'Sky Azure', value: '#38BDF8', bg: 'bg-[#38BDF8]/15 text-[#0284C7] border-[#38BDF8]/30' },
  { name: 'Warm Amber', value: '#F59E0B', bg: 'bg-[#F59E0B]/15 text-[#D97706] border-[#F59E0B]/30' },
  { name: 'Soft Violet', value: '#A855F7', bg: 'bg-[#A855F7]/15 text-[#9333EA] border-[#A855F7]/30' },
];

export function getSubjectColorStyle(colorValue: string) {
  const match = SUBJECT_COLORS.find(c => c.value.toLowerCase() === colorValue.toLowerCase());
  return match || { name: 'Custom', value: colorValue, bg: 'bg-primary/10 text-primary border-primary/20' };
}
