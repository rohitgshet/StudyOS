import React, { useState, useEffect, useRef } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../common/Toast';
import { sound } from '../../lib/sound';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  CloudRain,
  Radio,
  Waves,
} from 'lucide-react';
import { formatTime, formatDate } from '../../lib/utils';
import confetti from 'canvas-confetti';

type SessionType = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export const FocusModeView: React.FC = () => {
  const { subjects, tasks, focusSessions, logFocusSession } = useStudyData();
  const { user } = useAuth();
  const toast = useToast();

  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');

  const durations: Record<SessionType, number> = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    custom: 50 * 60,
  };

  const [timeLeft, setTimeLeft] = useState<number>(durations.pomodoro);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise' | 'binaural'>('off');
  const [volume, setVolume] = useState<number>(0.2);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectSessionType = (type: SessionType) => {
    setIsActive(false);
    setSessionType(type);
    setTimeLeft(durations[type]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      sound.playTimerComplete();
      sound.stopAmbient();
      setAmbientSound('off');

      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {}

      const durationMins = Math.round(durations[sessionType] / 60);

      if (sessionType === 'pomodoro' || sessionType === 'custom') {
        logFocusSession({
          durationMinutes: durationMins,
          type: sessionType,
          subjectId: selectedSubjectId || undefined,
          taskId: selectedTaskId || undefined,
          notes: sessionNotes || 'Focused study block',
        });
        toast.success(`Completed ${durationMins}m focus session! Streak updated 🔥`);
      } else {
        toast.info('Break completed! Ready for another study block?');
      }

      setTimeLeft(durations[sessionType]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, sessionType]);

  useEffect(() => {
    if (ambientSound === 'off') {
      sound.stopAmbient();
    } else {
      sound.startAmbient(ambientSound as 'rain' | 'whitenoise' | 'binaural', volume);
    }
    return () => {
      sound.stopAmbient();
    };
  }, [ambientSound]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    sound.setAmbientVolume(newVol);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPercent = ((durations[sessionType] - timeLeft) / durations[sessionType]) * 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = focusSessions.filter(s => s.completedAt.startsWith(todayStr));
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div
      ref={containerRef}
      className={`space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background p-8 overflow-y-auto' : ''
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#0071E3]" />
            Distraction-Free Focus Mode
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pomodoro timer, scientifically tuned ambient noise, and session tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            icon={isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Main Focus Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Timer Core (8 Cols) */}
        <div className="lg:col-span-8 apple-glass-card rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center shadow-apple-glass dark:shadow-apple-glass-dark relative overflow-hidden space-y-8">
          {/* Subtle Ambient Glow inside Timer Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-[#0071E3]/10 via-[#F472B6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Session Type Selectors (Apple Glass Capsule) */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white/60 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] rounded-full backdrop-blur-md shadow-2xs">
            <button
              onClick={() => handleSelectSessionType('pomodoro')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                sessionType === 'pomodoro'
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pomodoro (25m)
            </button>
            <button
              onClick={() => handleSelectSessionType('short_break')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                sessionType === 'short_break'
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleSelectSessionType('long_break')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                sessionType === 'long_break'
                  ? 'bg-[#38BDF8] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Long Break (15m)
            </button>
            <button
              onClick={() => handleSelectSessionType('custom')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                sessionType === 'custom'
                  ? 'bg-[#F472B6] text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Deep Work (50m)
            </button>
          </div>

          {/* Big Circular Clock Display */}
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress Ring */}
            <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-black/[0.05] dark:text-white/[0.08] stroke-current"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="text-[#0071E3] stroke-current transition-all duration-300 drop-shadow-[0_0_12px_rgba(0,113,227,0.35)]"
                strokeWidth="3.5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Time Digits */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-6xl sm:text-7xl font-bold font-mono tracking-tighter text-foreground">
                {timeFormatted}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono mt-1 font-medium">
                {isActive ? 'Session in progress' : 'Ready to focus'}
              </span>
            </div>
          </div>

          {/* Controls: Play / Pause / Reset */}
          <div className="relative z-10 flex items-center gap-4">
            <Button
              size="lg"
              variant={isActive ? 'secondary' : 'primary'}
              icon={isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              onClick={() => setIsActive(!isActive)}
              className="px-8 py-3 text-base shadow-md font-semibold bg-[#0071E3] hover:bg-[#005BB6] text-white rounded-2xl"
            >
              {isActive ? 'Pause' : 'Start Focus'}
            </Button>

            <Button
              variant="outline"
              size="lg"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => {
                setIsActive(false);
                setTimeLeft(durations[sessionType]);
              }}
              title="Reset Timer"
              className="rounded-2xl"
            >
              Reset
            </Button>
          </div>

          {/* Active Target Task/Subject Binding */}
          <div className="relative z-10 w-full max-w-md pt-5 border-t border-black/[0.05] dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Focusing On Subject:</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground rounded-xl px-3 py-1.5 outline-none backdrop-blur-md"
              >
                <option value="">General Study</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Linked Task:</label>
              <select
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                className="w-full bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.12] text-foreground rounded-xl px-3 py-1.5 outline-none backdrop-blur-md"
              >
                <option value="">None (Free study)</option>
                {tasks.filter(t => t.status !== 'completed').map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Ambient Audio & Stats Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Ambient Sound Synthesizer (Apple Glass) */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#0071E3]" />
                <h3 className="text-sm font-semibold text-foreground">Ambient Soundscapes</h3>
              </div>
              {ambientSound !== 'off' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#0071E3] dark:text-[#38BDF8] font-mono animate-pulse border border-[#0071E3]/30">
                  Playing
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Synthesized directly inside your browser via Web Audio API without network streams.
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => setAmbientSound(ambientSound === 'rain' ? 'off' : 'rain')}
                className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                  ambientSound === 'rain'
                    ? 'border-[#38BDF8] bg-[#38BDF8]/15 text-[#0284C7] dark:text-[#7DD3FC] font-semibold shadow-2xs'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] text-foreground'
                }`}
              >
                <CloudRain className="w-4 h-4 text-[#38BDF8]" />
                Rain Storm
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'binaural' ? 'off' : 'binaural')}
                className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                  ambientSound === 'binaural'
                    ? 'border-[#F472B6] bg-[#F472B6]/15 text-[#DB2777] dark:text-[#F9A8D4] font-semibold shadow-2xs'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] text-foreground'
                }`}
              >
                <Waves className="w-4 h-4 text-[#F472B6]" />
                Alpha Waves
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === 'whitenoise' ? 'off' : 'whitenoise')}
                className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                  ambientSound === 'whitenoise'
                    ? 'border-[#DEC5A6] bg-[#DEC5A6]/25 text-[#92400E] dark:text-[#FDE68A] font-semibold shadow-2xs'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] text-foreground'
                }`}
              >
                <Radio className="w-4 h-4 text-[#DEC5A6]" />
                White Noise
              </button>

              <button
                onClick={() => setAmbientSound('off')}
                className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
                  ambientSound === 'off'
                    ? 'border-transparent bg-black/[0.05] dark:bg-white/[0.06] text-muted-foreground'
                    : 'border-black/[0.06] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.03] hover:bg-white/80 text-foreground'
                }`}
              >
                <VolumeX className="w-4 h-4 text-muted-foreground" />
                Mute Audio
              </button>
            </div>

            {/* Volume Slider */}
            {ambientSound !== 'off' && (
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.08] space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" /> Volume
                  </span>
                  <span className="font-mono">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={e => handleVolumeChange(Number(e.target.value))}
                  className="w-full accent-[#0071E3]"
                />
              </div>
            )}
          </div>

          {/* Today's Focus Summary Card */}
          <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-3.5">
            <h3 className="text-sm font-semibold text-foreground">Today's Focus Activity</h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-white/50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.06]">
                <span className="text-2xl font-bold font-mono text-[#0071E3] dark:text-[#38BDF8]">{todayMinutes}m</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Total Focused</p>
              </div>
              <div className="p-3.5 bg-white/50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.06]">
                <span className="text-2xl font-bold font-mono text-[#10B981]">{todaySessions.length}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Sessions Done</p>
              </div>
            </div>

            {/* Recent Logged Sessions */}
            <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
              {focusSessions.slice(0, 4).map(session => {
                const sub = subjects.find(s => s.id === session.subjectId);
                return (
                  <div
                    key={session.id}
                    className="p-2.5 rounded-2xl bg-white/40 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        {session.durationMinutes}m {session.type}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {sub?.code || 'General'} • {session.notes || 'Focus work'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatDate(session.completedAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
