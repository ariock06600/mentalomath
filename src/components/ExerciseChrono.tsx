import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Zap, Check } from 'lucide-react';
import { sounds } from '../utils/audio.ts';

interface ExerciseChronoProps {
  id?: string;
  onTimeUpdate?: (elapsedMs: number) => void;
  onChronoToggled?: (isEnabled: boolean) => void;
  compact?: boolean;
  className?: string;
  label?: string;
  initialEnabled?: boolean;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}.${tenths}`;
}

export function formatFriendlyTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }
  return `${minutes} min ${seconds}s`;
}

export const ExerciseChrono: React.FC<ExerciseChronoProps> = ({
  id = 'default',
  onTimeUpdate,
  onChronoToggled,
  compact = false,
  className = '',
  label = 'Chrono de l’exercice',
  initialEnabled = false,
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`mathimulti_chrono_enabled_${id}`);
      return saved !== null ? saved === 'true' : initialEnabled;
    } catch {
      return initialEnabled;
    }
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const lastTickTimeRef = useRef<number | null>(null);

  // Notify parent on toggle
  const handleToggleChrono = () => {
    sounds.playClick();
    const next = !isEnabled;
    setIsEnabled(next);
    try {
      localStorage.setItem(`mathimulti_chrono_enabled_${id}`, String(next));
    } catch {
      // ignore
    }
    if (next) {
      setIsRunning(true);
      lastTickTimeRef.current = Date.now();
    } else {
      setIsRunning(false);
    }
    if (onChronoToggled) {
      onChronoToggled(next);
    }
  };

  // Stopwatch timer tick
  useEffect(() => {
    if (!isEnabled || !isRunning) {
      lastTickTimeRef.current = null;
      return;
    }

    lastTickTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = lastTickTimeRef.current ? now - lastTickTimeRef.current : 100;
      lastTickTimeRef.current = now;
      setElapsedMs((prev) => {
        const next = prev + delta;
        if (onTimeUpdate) onTimeUpdate(next);
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isEnabled, isRunning, onTimeUpdate]);

  const handleTogglePlayPause = () => {
    sounds.playClick();
    if (!isRunning) {
      lastTickTimeRef.current = Date.now();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    sounds.playClick();
    setElapsedMs(0);
    if (onTimeUpdate) onTimeUpdate(0);
    lastTickTimeRef.current = isRunning ? Date.now() : null;
  };

  return (
    <div
      className={`transition-all rounded-2xl ${
        isEnabled
          ? 'bg-slate-900/90 border-2 border-amber-500/50 shadow-md shadow-amber-500/10'
          : 'bg-slate-900/50 border border-slate-800/80 hover:border-slate-700'
      } p-2.5 sm:p-3 flex items-center justify-between gap-3 ${className}`}
    >
      {/* Left: Toggle & Info */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleToggleChrono}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            isEnabled
              ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30 ring-2 ring-amber-400'
              : 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750'
          }`}
          title={isEnabled ? 'Désactiver le chrono' : 'Activer le chrono pour cet exercice'}
        >
          <Timer className={`w-4 h-4 ${isEnabled ? 'text-slate-950 animate-pulse' : 'text-slate-400'}`} />
          <span>{isEnabled ? 'Chrono actif' : 'Activer le chrono'}</span>
        </button>

        {!compact && (
          <span className="text-xs text-slate-400 hidden md:inline">
            {isEnabled ? 'Chronomètre activé (à l’envie)' : 'Optionnel · Mesure ton temps'}
          </span>
        )}
      </div>

      {/* Right: Stopwatch Display & Controls when enabled */}
      {isEnabled ? (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Digital Clock */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
            <span className="font-mono font-black text-amber-400 text-base sm:text-lg tabular-nums tracking-wider">
              {formatTime(elapsedMs)}
            </span>
          </div>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={handleTogglePlayPause}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title={isRunning ? 'Mettre en pause' : 'Reprendre'}
            aria-label={isRunning ? 'Mettre en pause' : 'Reprendre'}
          >
            {isRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Remettre à zéro"
            aria-label="Remettre à zéro"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400/60" />
          <span>Activable à l’envie</span>
        </div>
      )}
    </div>
  );
};
