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

const TeaTimer: React.FC = () => {
  const [initialTime, setInitialTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timerPhase, setTimerPhase] = useState<TimerPhase>('idle');
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevTimeLeftRef = useRef(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]); // Зависит только от isRunning

  useEffect(() => {
    // Обработка перехода фаз и добавления в завершенные
    if (prevTimeLeftRef.current > 0 && timeLeft === 0 && timerPhase === 'brewing') {
      console.log('Brewing completed! Transitioning to cooling phase.', { initialTime, timeLeft, isRunning });
      if (audioRef.current) {
        audioRef.current.play();
      }
      setTimerPhase('cooling'); // Переход в фазу остывания
    }

    // Если таймер был запущен, и timeLeft стал 0 или меньше, но фаза еще 'brewing',
    // это означает, что мы только что достигли 0.
    // Если timeLeft < 0 и фаза 'cooling', то это уже фаза остывания.

    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft, initialTime, timerPhase, isRunning]);

  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const minutes = Math.floor(absTime / 60);
    const seconds = absTime % 60;
    const sign = time < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = (timeInSeconds: number) => {
    setIsRunning(false); // Остановить любой текущий таймер
    setInitialTime(timeInSeconds);
    setTimeLeft(timeInSeconds);
    setTimerPhase('brewing'); // Начать фазу заваривания
    setIsRunning(true); // Запустить таймер
  };

  const handleStopAndComplete = () => {
    console.log('Stop/Reset button clicked!', { isRunning, timerPhase, initialTime, timeLeft }); // Отладочное сообщение
    if (isRunning || timerPhase !== 'idle') {
      setIsRunning(false);
      setTimerPhase('idle');
      if (timerPhase === 'cooling') {
        const completedTimerLabel = predefinedTimers.find(t => t.value === initialTime)?.label || `${initialTime} sec`;
        setCompletedTimers(prev => [...prev, { label: completedTimerLabel, value: initialTime, timestamp: Date.now() }]);
      }
      setInitialTime(0);
      setTimeLeft(0);
    }
  };

  const currentTimerIsActive = isRunning || timerPhase === 'cooling';

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

      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Доступные таймеры</h2>
      <div className="w-full space-y-2">
        {predefinedTimers.map((timer) => (
          <div
            key={timer.value}
            className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--color-bg-secondary)] bg-opacity-50 text-[var(--color-text-primary)] hover:bg-opacity-70 hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)] focus-within:ring-opacity-50"
          >
            <button
              onClick={() => handleTimerClick(timer.value)}
              className="flex items-center flex-grow focus:outline-none"
              aria-label={`Запустить таймер на ${timer.label}`}
              disabled={currentTimerIsActive}
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
            {currentTimerIsActive && initialTime === timer.value && (
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${timerPhase === 'cooling' ? 'text-red-500' : 'text-[var(--color-accent-primary)]'} animate-pulse`}>
                  {formatTime(timeLeft)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleStopAndComplete(); }}
                  className="w-8 h-8 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-gray-800 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-opacity-50 transition-all duration-200 shadow-md"
                  aria-label={timerPhase === 'brewing' ? "Отменить таймер" : "Остановить и завершить таймер"}
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
            )}
          </div>
        ))}
      </div>
      <audio ref={audioRef} src="/bell.mp3" />
    </div>
  );
};

export default TeaTimer;
