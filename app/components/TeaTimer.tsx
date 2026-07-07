'use client';

import React, { useState, useEffect, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';

const Metaballs = dynamic(
  () => import('@paper-design/shaders-react').then(mod => mod.Metaballs),
  { ssr: false }
);

class ShaderErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface CompletedTimer {
  id: string;
  label: string;
  value: number;
  timestamp: number;
}

type TimerPhase = 'idle' | 'brewing' | 'cooling';

interface TimerInstance {
  id: string;
  initialTime: number;
  timeLeft: number;
  isRunning: boolean;
  timerPhase: TimerPhase;
  label: string;
}

const TeaTimer: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<TimerInstance[]>([]);
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currentDisplayTimerId, setCurrentDisplayTimerId] = useState<string | null>(null);


  const currentDisplayTimer = activeTimers.find(timer => timer.id === currentDisplayTimerId);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setActiveTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((timer) => {
          if (!timer.isRunning) return timer;

          const newTimeLeft = timer.timeLeft - 1;
          let newTimerPhase = timer.timerPhase;

          if (newTimeLeft <= 0 && timer.timerPhase === 'brewing') {
            console.log(`Brewing completed for timer ${timer.id}! Transitioning to cooling phase.`, { initialTime: timer.initialTime, timeLeft: newTimeLeft, isRunning: timer.isRunning });
            if (typeof window !== 'undefined') {
              new Audio('/notification.mp3').play();
            }
            newTimerPhase = 'cooling';
          }

          return {
            ...timer,
            timeLeft: newTimeLeft,
            timerPhase: newTimerPhase,
            isRunning: newTimeLeft > 0 || newTimerPhase === 'cooling', // Keep running if cooling
          };
        });

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []); // Зависит только от isRunning


  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const minutes = Math.floor(absTime / 60);
    const seconds = absTime % 60;
    const sign = time < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMinuteChange = (delta: number) => {
    setMinutes((prevMinutes) => (prevMinutes + delta + 60) % 60);
  };

  const handleSecondChange = (delta: number) => {
    setSeconds((prevSeconds) => (prevSeconds + delta + 60) % 60);
  };

  const handleStartTimer = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setActiveTimers((prevTimers) => {
        prevTimers.forEach((timer) => {
          if (timer.timerPhase === 'cooling') {
            setCompletedTimers((prev) => {
              if (!prev.some((t) => t.id === timer.id)) {
                return [...prev, { id: timer.id, label: timer.label, value: timer.initialTime, timestamp: Date.now() }];
              }
              return prev;
            });
          }
        });
        return prevTimers.filter((t) => t.timerPhase !== 'cooling');
      });

      const newTimer: TimerInstance = {
        id: Date.now().toString(),
        initialTime: totalSeconds,
        timeLeft: totalSeconds,
        isRunning: true,
        timerPhase: 'brewing',
        label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      };
      setActiveTimers((prevTimers) => [...prevTimers, newTimer]);
      setCurrentDisplayTimerId(newTimer.id);
    }
  };

  const handleStopAndComplete = (id: string) => {
    const stoppedTimer = activeTimers.find(timer => timer.id === id);

    if (stoppedTimer) {
      if (stoppedTimer.timerPhase === 'cooling') {
        setCompletedTimers(prevCompleted => {
          if (!prevCompleted.some(t => t.id === stoppedTimer.id)) {
            return [...prevCompleted, {
              id: stoppedTimer.id,
              label: stoppedTimer.label,
              value: stoppedTimer.initialTime,
              timestamp: Date.now()
            }];
          }
          return prevCompleted;
        });
      }

      setActiveTimers(prevTimers => {
        const remainingTimers = prevTimers.filter(timer => timer.id !== id);
        if (id === currentDisplayTimerId) {
          setCurrentDisplayTimerId(remainingTimers.length > 0 ? remainingTimers[0].id : null);
        }
        return remainingTimers;
      });
    }
  };

  const handleDeleteCompleted = (id: string) => {
    setCompletedTimers(prev => prev.filter(t => t.id !== id));
  };

  return (
      <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleMinuteChange(1)}
                className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white flex items-center justify-center text-sm font-bold shadow-md transition-colors duration-200"
                aria-label="Increase minutes"
              >
                m
              </button>
              <div className="my-1">
                <div className="text-6xl font-bold text-[var(--color-text-primary)] w-24 text-center">{String(minutes).padStart(2, '0')}</div>
              </div>
              <button
                onClick={() => handleMinuteChange(-1)}
                className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white flex items-center justify-center text-sm font-bold shadow-md transition-colors duration-200"
                aria-label="Decrease minutes"
              >
                m
              </button>
            </div>
          </div>

          <span className="text-6xl font-bold text-[var(--color-text-primary)]">:</span>

          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleSecondChange(10)}
                className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white flex items-center justify-center text-sm font-bold shadow-md transition-colors duration-200"
                aria-label="Increase seconds"
              >
                s
              </button>
              <div className="my-1">
                <div className="text-6xl font-bold text-[var(--color-text-primary)] w-24 text-center">{String(seconds).padStart(2, '0')}</div>
              </div>
              <button
                onClick={() => handleSecondChange(-10)}
                className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-primary)] hover:text-white flex items-center justify-center text-sm font-bold shadow-md transition-colors duration-200"
                aria-label="Decrease seconds"
              >
                s
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 w-full mb-8">
          <button
            onClick={() => currentDisplayTimer && handleStopAndComplete(currentDisplayTimer.id)}
            className="w-1/3 p-3 rounded-lg bg-white text-gray-800 text-lg font-semibold hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-md"
            disabled={!currentDisplayTimer}
          >
            Stop
          </button>
          <button
            onClick={handleStartTimer}
            className="w-2/3 p-3 rounded-lg bg-[var(--color-accent-primary)] text-white text-lg font-semibold hover:bg-[var(--color-accent-secondary)] transition-colors duration-200 shadow-md"
            disabled={minutes === 0 && seconds === 0}
          >
            Start
          </button>
        </div>

        <div className="relative w-full p-3 rounded-lg shadow-md min-h-[100px] overflow-hidden">
          {currentDisplayTimer ? (
            <>
              <div className="absolute inset-0">
                <ShaderErrorBoundary fallback={
                  <div className={`w-full h-full ${currentDisplayTimer.timerPhase === 'cooling' ? 'bg-red-900' : 'bg-green-900'}`} />
                }>
                  <Metaballs
                    width={600}
                    height={200}
                    colors={currentDisplayTimer.timerPhase === 'cooling' ? ["#ff0000", "#ff4444", "#ff6666", "#cc0000", "#ff2222"] : ["#2e7d32", "#4caf50", "#66bb6a", "#1b5e20", "#43a047"]}
                    colorBack="#000000"
                    count={12}
                    size={0.6}
                    speed={0.3}
                    scale={1.0}
                  />
                </ShaderErrorBoundary>
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
                <span className="text-lg text-[var(--color-text-primary)] drop-shadow-md">{currentDisplayTimer.label}</span>
                <span className={`text-5xl font-bold ${currentDisplayTimer.timerPhase === 'cooling' ? 'text-red-500 animate-pulse' : 'text-[var(--color-accent-primary)]'} drop-shadow-md`}>
                  {formatTime(currentDisplayTimer.timeLeft)}
                </span>
              </div>
            </>
          ) : (
            <span className="text-lg text-[var(--color-text-secondary)]">No active timer</span>
          )}
        </div>

        <div className="w-full mt-6">
          <button
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-opacity-70 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-opacity-50"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 mr-2 transform ${isAccordionOpen ? 'rotate-0' : '-rotate-90'} transition-transform duration-200`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
              <span className="text-lg">Completed Timers ({completedTimers.length})</span>
            </div>
            {/* Icon/indicator on the right, if needed */}
          </button>
          <div className="min-h-[100px]">
            {isAccordionOpen && completedTimers.length > 0 && (
              <div className="space-y-1 mt-2 p-2 bg-[var(--color-bg-secondary)] rounded-lg shadow-inner">
                {completedTimers.map((timer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-30 text-[var(--color-text-secondary)] text-md">
                    <div className="flex items-center">
                      <span className="mr-2">✅</span>
                      <span>{timer.label}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCompleted(timer.id)}
                      className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors duration-200"
                      aria-label="Delete timer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default TeaTimer;
