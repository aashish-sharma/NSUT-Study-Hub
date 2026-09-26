import { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Clock } from "lucide-react";
import { storage, type TimerState } from "../lib/storage";
import clsx from "clsx";

const STUDY_DURATION = 25 * 60 * 1000;
const BREAK_DURATION = 5 * 60 * 1000;

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
}

export function PomodoroPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [state, setState] = useState<TimerState>(() => storage.readTimer());
  const [timeLeft, setTimeLeft] = useState(() => {
    const duration = state.phase === "study" ? STUDY_DURATION : BREAK_DURATION;
    if (state.isRunning && state.endTimestamp) {
      return Math.max(0, state.endTimestamp - Date.now());
    }
    return Math.max(0, duration - state.elapsedSoFar);
  });

  useEffect(() => {
    const handleUpdate = () => {
      setState(storage.readTimer());
    };
    window.addEventListener("studyhub:timer-update", handleUpdate);
    return () => window.removeEventListener("studyhub:timer-update", handleUpdate);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (state.isRunning) {
      interval = setInterval(() => {
        if (!state.endTimestamp) return;
        const remaining = Math.max(0, state.endTimestamp - Date.now());
        setTimeLeft(remaining);

        if (remaining === 0) {
          if (state.soundEnabled) {
            playBeep();
          }
          const nextPhase = state.phase === "study" ? "break" : "study";
          const nextState: TimerState = {
            endTimestamp: null,
            phase: nextPhase,
            isRunning: false,
            elapsedSoFar: 0,
            soundEnabled: state.soundEnabled
          };
          storage.writeTimer(nextState);
          setState(nextState);
        }
      }, 1000);
    } else {
      const duration = state.phase === "study" ? STUDY_DURATION : BREAK_DURATION;
      setTimeLeft(Math.max(0, duration - state.elapsedSoFar));
    }
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleStart = () => {
    const duration = state.phase === "study" ? STUDY_DURATION : BREAK_DURATION;
    const nextState: TimerState = {
      ...state,
      isRunning: true,
      endTimestamp: Date.now() + (duration - state.elapsedSoFar)
    };
    storage.writeTimer(nextState);
    setState(nextState);
  };

  const handlePause = () => {
    const duration = state.phase === "study" ? STUDY_DURATION : BREAK_DURATION;
    const elapsed = state.endTimestamp ? (duration - (state.endTimestamp - Date.now())) : state.elapsedSoFar;
    const nextState: TimerState = {
      ...state,
      isRunning: false,
      endTimestamp: null,
      elapsedSoFar: Math.max(0, elapsed)
    };
    storage.writeTimer(nextState);
    setState(nextState);
  };

  const handleReset = () => {
    const nextState: TimerState = {
      ...state,
      isRunning: false,
      endTimestamp: null,
      elapsedSoFar: 0
    };
    storage.writeTimer(nextState);
    setState(nextState);
  };

  const handleToggleSound = () => {
    const nextState = { ...state, soundEnabled: !state.soundEnabled };
    storage.writeTimer(nextState);
    setState(nextState);
  };

  const handleTogglePhase = () => {
    const nextPhase = state.phase === "study" ? "break" : "study";
    const nextState: TimerState = {
      ...state,
      phase: nextPhase,
      isRunning: false,
      endTimestamp: null,
      elapsedSoFar: 0
    };
    storage.writeTimer(nextState);
    setState(nextState);
  };

  const isStudy = state.phase === "study";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Study Timer"
        className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 text-[var(--text-sm-fluid)] font-medium rounded-[var(--radius-base)] transition-colors duration-[150ms] min-h-[44px]",
          isOpen ? "bg-[var(--color-border)] text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)]"
        )}
      >
        <Clock size={16} strokeWidth={2} />
        <span className="hidden sm:inline">Timer</span>
        {state.isRunning && (
          <span className="ml-1 text-[var(--color-accent)] font-semibold w-10 text-right">
            {formatTime(timeLeft)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-base)] shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleTogglePhase}
              className="text-[var(--text-sm-fluid)] font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
            >
              {isStudy ? "Study Session" : "Break Time"}
            </button>
            <button
              onClick={handleToggleSound}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-[var(--radius-sm)]"
              aria-label={state.soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {state.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          <div className="text-4xl font-bold text-center mb-6 font-mono text-[var(--color-text)]">
            {formatTime(timeLeft)}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={state.isRunning ? handlePause : handleStart}
              className="w-12 h-12 flex items-center justify-center bg-[var(--color-accent)] text-white rounded-full hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]"
              aria-label={state.isRunning ? "Pause" : "Start"}
            >
              {state.isRunning ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-border)] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
              aria-label="Reset"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
