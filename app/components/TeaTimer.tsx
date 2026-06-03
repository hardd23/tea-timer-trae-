'use client';

import React, { useState, useEffect, useRef } from 'react';

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
    setMinutes((prevMinutes) => Math.max(0, prevMinutes + delta));
  };

  const handleSecondChange = (delta: number) => {
    setSeconds((prevSeconds) => {
      let newSeconds = prevSeconds + delta;
      if (newSeconds >= 60) {
        setMinutes((prevMinutes) => prevMinutes + 1);
        return newSeconds - 60;
      }
      if (newSeconds < 0) {
        if (minutes > 0) {
          setMinutes((prevMinutes) => prevMinutes - 1);
          return newSeconds + 60;
        }
        return 0; // Не уходим в отрицательные секунды, если минут нет
      }
      return newSeconds;
    });
  };

  const handleStartTimer = () => {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds > 0) {
      const newTimer: TimerInstance = {
        id: Date.now().toString(),
        initialTime: totalSeconds,
        timeLeft: totalSeconds,
        isRunning: true,
        timerPhase: 'brewing',
        label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        isCompletedByEffect: false,
      };
      setActiveTimers((prevTimers) => [...prevTimers, newTimer]);
      setCurrentDisplayTimerId(newTimer.id);
      setMinutes(0);
      setSeconds(0);
    }
  };

  const handleStopAndComplete = (id: string) => {
    // Find the timer to be stopped from the current activeTimers state
    const stoppedTimer = activeTimers.find(timer => timer.id === id);

    if (stoppedTimer) {
      // Add to completedTimers first
      setCompletedTimers(prevCompleted => {
        // Ensure it's not already in completedTimers (using its unique ID)
        if (!prevCompleted.some(t => t.id === stoppedTimer.id)) {
          return [...prevCompleted, {
            id: stoppedTimer.id,
            label: stoppedTimer.label,
            value: stoppedTimer.initialTime,
            timestamp: Date.now() // New timestamp for completion
          }];
        }
        return prevCompleted;
      });

      // Then, update activeTimers to remove the stopped timer
      setActiveTimers(prevTimers => {
        const remainingTimers = prevTimers.filter(timer => timer.id !== id);
        // Adjust currentDisplayTimerId if the stopped timer was the one being displayed
        if (id === currentDisplayTimerId) {
          setCurrentDisplayTimerId(remainingTimers.length > 0 ? remainingTimers[0].id : null);
        }
        return remainingTimers;
      });
    }
  };

  const currentTimerIsActive = activeTimers.some(timer => timer.isRunning || timer.timerPhase === 'cooling');

  return (
      <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[var(--color-text-secondary)]">Min.</span>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleMinuteChange(1)}
                className="text-4xl text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors duration-200"
                aria-label="Increase minutes"
              >
                ▲
              </button>
              <div className="flex space-x-1 bg-[var(--color-bg-secondary)] rounded-lg p-2 shadow-md">
                <div className="text-6xl font-bold text-[var(--color-text-primary)] w-24 text-center">{String(minutes).padStart(2, '0')}</div>
              </div>
              <button
                onClick={() => handleMinuteChange(-1)}
                className="text-4xl text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors duration-200"
                aria-label="Decrease minutes"
              >
                ▼
              </button>
            </div>
          </div>

          <span className="text-6xl font-bold text-[var(--color-text-primary)]">:</span>

          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleSecondChange(10)}
                className="text-4xl text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors duration-200"
                aria-label="Increase seconds"
              >
                ▲
              </button>
              <div className="flex space-x-1 bg-[var(--color-bg-secondary)] rounded-lg p-2 shadow-md">
                <div className="text-6xl font-bold text-[var(--color-text-primary)] w-24 text-center">{String(seconds).padStart(2, '0')}</div>
              </div>
              <button
                onClick={() => handleSecondChange(-10)}
                className="text-4xl text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)] transition-colors duration-200"
                aria-label="Decrease seconds"
              >
                ▼
              </button>
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">Sec.</span>
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

        <div className="flex flex-col items-center justify-center space-y-2 w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-50 text-[var(--color-text-primary)] shadow-md min-h-[100px]">
          {currentDisplayTimer ? (
            <>
              <span className="text-lg">{currentDisplayTimer.label}</span>
              <span className={`text-5xl font-bold ${currentDisplayTimer.timerPhase === 'cooling' ? 'text-red-500' : 'text-[var(--color-accent-primary)]'} animate-pulse`}>
                {formatTime(currentDisplayTimer.timeLeft)}
              </span>
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
                  <div key={index} className="flex items-center p-2 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-30 text-[var(--color-text-secondary)] text-md">
                    <span className="mr-2">✅</span>
                    <span>{timer.label}</span>
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
