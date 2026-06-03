'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CompletedTimer {
  label: string;
  value: number;
  timestamp: number;
}

const predefinedTimers = [
  { label: '20 sec', value: 20 },
  { label: '30 sec', value: 30 },
  { label: '40 sec', value: 40 },
  { label: '50 sec', value: 50 },
  { label: '1 min', value: 60 },
  { label: '1.5 min', value: 90 },
  { label: '2 min', value: 120 },
  { label: '2.5 min', value: 150 },
  { label: '3 min', value: 180 },
];

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


  useEffect(() => {
    const timerInterval = setInterval(() => {
      setActiveTimers((prevTimers) => {
        const updatedTimers = prevTimers.map((timer) => {
          if (!timer.isRunning) return timer;

          const newTimeLeft = timer.timeLeft - 1;
          let newTimerPhase = timer.timerPhase;

          if (newTimeLeft <= 0 && timer.timerPhase === 'brewing') {
            console.log(`Brewing completed for timer ${timer.id}! Transitioning to cooling phase.`, { initialTime: timer.initialTime, timeLeft: newTimeLeft, isRunning: timer.isRunning });
            if (audioRef.current) {
              audioRef.current.play();
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
  }, [audioRef]); // Зависит только от isRunning


  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const minutes = Math.floor(absTime / 60);
    const seconds = absTime % 60;
    const sign = time < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = (timeInSeconds: number, label: string) => {
    const newTimer: TimerInstance = {
      id: Date.now().toString(), // Простой уникальный ID
      initialTime: timeInSeconds,
      timeLeft: timeInSeconds,
      isRunning: true,
      timerPhase: 'brewing',
      label: label,
    };
    setActiveTimers((prevTimers) => [...prevTimers, newTimer]);
  };

  const handleStopAndComplete = (id: string) => {
    console.log(`handleStopAndComplete called for timer ID: ${id}`);
    setActiveTimers((prevTimers) => {
      const stoppedTimer = prevTimers.find(timer => timer.id === id);
      if (stoppedTimer) {
        const completedTimerLabel = stoppedTimer.label;
        setCompletedTimers(prev => {
          console.log(`Adding to completedTimers: ${completedTimerLabel} (ID: ${id})`);
          return [...prev, { label: completedTimerLabel, value: stoppedTimer.initialTime, timestamp: Date.now() }];
        });
        return prevTimers.filter(timer => timer.id !== id);
      }
      return prevTimers;
    });
  };

  const currentTimerIsActive = activeTimers.some(timer => timer.isRunning || timer.timerPhase === 'cooling');

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {completedTimers.length > 0 && (
        <div className="w-full mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Завершенные таймеры ({completedTimers.length})</h2>
          <div className="space-y-1">
            {completedTimers.map((timer, index) => (
              <div key={index} className="flex items-center p-2 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-30 text-[var(--color-text-secondary)] text-md">
                <span className="mr-2">✅</span>
                <span>{timer.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTimers.length > 0 && (
        <div className="w-full mb-6">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Активные таймеры</h2>
          <div className="space-y-2">
            {activeTimers.map((timer) => (
              <div
                key={timer.id}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-50 text-[var(--color-text-primary)] shadow-md"
              >
                <span className="text-lg">{timer.label}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xl font-bold ${timer.timerPhase === 'cooling' ? 'text-red-500' : 'text-[var(--color-accent-primary)]'} animate-pulse`}>
                    {formatTime(timer.timeLeft)}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStopAndComplete(timer.id); }}
                    className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-gray-800 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-opacity-50 transition-all duration-200 shadow-md"
                    aria-label={timer.timerPhase === 'brewing' ? "Отменить таймер" : "Остановить и завершить таймер"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Доступные таймеры</h2>
      <div className="w-full space-y-2">
        {predefinedTimers.map((timer) => (
          <div
            key={timer.value}
            className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-50 text-[var(--color-text-primary)] hover:bg-opacity-70 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)] focus-within:ring-opacity-50"
          >
            <button
              onClick={() => handleTimerClick(timer.value, timer.label)}
              className="flex items-center flex-grow focus:outline-none"
              aria-label={`Запустить таймер на ${timer.label}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[var(--color-text-secondary)] mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-lg">{timer.label}</span>
            </button>
          </div>
        ))}
      </div>
  );
};

export default TeaTimer;
