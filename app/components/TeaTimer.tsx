'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface CompletedTimer {
  id: string;
  label: string;
}

type TimerPhase = 'brewing' | 'cooling';

interface TimerInstance {
  id: string;
  initialTime: number;
  endAt: number;
  timeLeft: number;
  isRunning: boolean;
  timerPhase: TimerPhase;
  label: string;
}

const HISTORY_ROW_HEIGHT = 56;

const TeaTimer: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<TimerInstance[]>([]);
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);
  const [{ minutes, seconds }, setTimerSetting] = useState({
    minutes: 0,
    seconds: 0,
  });
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [currentDisplayTimerId, setCurrentDisplayTimerId] = useState<string | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const historyListRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFrameRef = useRef<number | null>(null);
  const coolingStartedRef = useRef<Set<string>>(new Set());

  const currentDisplayTimer = activeTimers.find(
    (timer) => timer.id === currentDisplayTimerId,
  );
  const hasActiveCountdown = Boolean(currentDisplayTimer?.isRunning);
  const isBrewingActive = currentDisplayTimer?.timerPhase === 'brewing';
  const progressTimerId = currentDisplayTimer?.id;
  const progressTimerPhase = currentDisplayTimer?.timerPhase;
  const progressTimerIsRunning = currentDisplayTimer?.isRunning;
  const progressEndAt = currentDisplayTimer?.endAt;
  const progressDurationMs = (currentDisplayTimer?.initialTime ?? 0) * 1000;

  const setProgressBarProgress = useCallback((progress: number) => {
    const progressBar = progressBarRef.current;

    if (!progressBar) return;

    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
  }, []);

  const recordCompletedTimer = useCallback((timer: CompletedTimer) => {
    setCompletedTimers((prevCompleted) => {
      if (prevCompleted.some((completed) => completed.id === timer.id)) {
        return prevCompleted;
      }

      return [...prevCompleted, { id: timer.id, label: timer.label }];
    });
  }, []);

  const startCooling = useCallback((timerId: string, overtimeSeconds: number) => {
    if (coolingStartedRef.current.has(timerId)) return;

    coolingStartedRef.current.add(timerId);
    setProgressBarProgress(0);

    setActiveTimers((prevTimers) =>
      prevTimers.map((activeTimer) =>
        activeTimer.id === timerId
          ? {
              ...activeTimer,
              timeLeft: overtimeSeconds > 0 ? -overtimeSeconds : 0,
              isRunning: true,
              timerPhase: 'cooling',
            }
          : activeTimer,
      ),
    );

    void new Audio('/notification.mp3').play().catch(() => undefined);
  }, [setProgressBarProgress]);

  const syncTimerState = useCallback(() => {
    if (
      !progressTimerId ||
      !progressTimerIsRunning ||
      progressEndAt === undefined ||
      progressDurationMs <= 0
    ) {
      return;
    }

    const remainingMs = progressEndAt - Date.now();

    if (progressTimerPhase === 'cooling') {
      const overtimeSeconds = Math.floor(Math.max(0, -remainingMs) / 1000);
      const coolingTimeLeft = overtimeSeconds > 0 ? -overtimeSeconds : 0;

      setProgressBarProgress(0);
      setActiveTimers((prevTimers) => {
        let didChange = false;
        const nextTimers = prevTimers.map((timer) => {
          if (timer.id !== progressTimerId || timer.timeLeft === coolingTimeLeft) {
            return timer;
          }

          didChange = true;
          return { ...timer, timeLeft: coolingTimeLeft };
        });

        return didChange ? nextTimers : prevTimers;
      });
      return;
    }

    const brewingRemainingMs = Math.max(0, remainingMs);
    const progress = Math.max(0, Math.min(1, brewingRemainingMs / progressDurationMs));

    setProgressBarProgress(progress);

    if (remainingMs <= 0) {
      const overtimeSeconds = Math.floor(Math.max(0, -remainingMs) / 1000);
      startCooling(progressTimerId, overtimeSeconds);
      return;
    }

    const remainingSeconds = Math.ceil(brewingRemainingMs / 1000);
    setActiveTimers((prevTimers) => {
      let didChange = false;
      const nextTimers = prevTimers.map((timer) => {
        if (timer.id !== progressTimerId || timer.timeLeft === remainingSeconds) {
          return timer;
        }

        didChange = true;
        return { ...timer, timeLeft: remainingSeconds };
      });

      return didChange ? nextTimers : prevTimers;
    });
  }, [
    progressDurationMs,
    progressEndAt,
    progressTimerId,
    progressTimerIsRunning,
    progressTimerPhase,
    setProgressBarProgress,
    startCooling,
  ]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimerState();
      }
    };
    const handlePageShow = () => syncTimerState();
    const timerInterval = window.setInterval(syncTimerState, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [syncTimerState]);

  useEffect(() => {
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }

    if (
      !progressTimerId ||
      progressTimerPhase !== 'brewing' ||
      !progressTimerIsRunning ||
      progressEndAt === undefined ||
      progressDurationMs <= 0
    ) {
      setProgressBarProgress(0);
      return;
    }

    const updateProgress = () => {
      const remainingMs = Math.max(0, progressEndAt - Date.now());
      const progress = Math.max(0, Math.min(1, remainingMs / progressDurationMs));
      setProgressBarProgress(progress);

      if (progress > 0) {
        progressFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        progressFrameRef.current = null;
        const overtimeSeconds = Math.floor(
          Math.max(0, Date.now() - progressEndAt) / 1000,
        );
        startCooling(progressTimerId, overtimeSeconds);
      }
    };

    updateProgress();

    return () => {
      if (progressFrameRef.current !== null) {
        cancelAnimationFrame(progressFrameRef.current);
        progressFrameRef.current = null;
      }
    };
  }, [
    progressDurationMs,
    progressEndAt,
    progressTimerId,
    progressTimerIsRunning,
    progressTimerPhase,
    setProgressBarProgress,
    startCooling,
  ]);

  const formatTime = (time: number) => {
    const absTime = Math.abs(time);
    const displayMinutes = Math.floor(absTime / 60);
    const displaySeconds = absTime % 60;
    const sign = time < 0 ? '-' : '';

    return `${sign}${displayMinutes.toString().padStart(2, '0')}:${displaySeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleMinuteChange = (delta: number) => {
    setTimerSetting((prevSetting) => ({
      ...prevSetting,
      minutes: (prevSetting.minutes + delta + 60) % 60,
    }));
  };

  const handleSecondChange = (delta: number) => {
    setTimerSetting((prevSetting) => {
      const currentTotalSeconds = prevSetting.minutes * 60 + prevSetting.seconds;
      const nextTotalSeconds = Math.max(0, currentTotalSeconds + delta);

      return {
        minutes: Math.floor(nextTotalSeconds / 60) % 60,
        seconds: nextTotalSeconds % 60,
      };
    });
  };

  const handleStartTimer = () => {
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) return;

    activeTimers
      .filter((timer) => timer.timerPhase === 'cooling')
      .forEach(recordCompletedTimer);

    setProgressBarProgress(1);

    const newTimer: TimerInstance = {
      id: Date.now().toString(),
      initialTime: totalSeconds,
      endAt: Date.now() + totalSeconds * 1000,
      timeLeft: totalSeconds,
      isRunning: true,
      timerPhase: 'brewing',
      label: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };

    coolingStartedRef.current.delete(newTimer.id);
    setActiveTimers((prevTimers) => [
      ...prevTimers.filter((timer) => timer.timerPhase !== 'cooling'),
      newTimer,
    ]);
    setCurrentDisplayTimerId(newTimer.id);
  };

  const handleResetTimer = (id: string) => {
    setActiveTimers((prevTimers) => {
      const remainingTimers = prevTimers.filter((timer) => timer.id !== id);

      if (id === currentDisplayTimerId) {
        setCurrentDisplayTimerId(remainingTimers.length > 0 ? remainingTimers[0].id : null);
      }

      return remainingTimers;
    });
  };

  const handleStopTimer = (timer: TimerInstance) => {
    if (timer.timerPhase === 'cooling') {
      recordCompletedTimer(timer);
    }

    coolingStartedRef.current.add(timer.id);
    if (progressFrameRef.current !== null) {
      cancelAnimationFrame(progressFrameRef.current);
      progressFrameRef.current = null;
    }
    setProgressBarProgress(0);
    handleResetTimer(timer.id);
  };

  const handleDeleteCompleted = (id: string) => {
    setCompletedTimers((prevCompleted) =>
      prevCompleted.filter((timer) => timer.id !== id),
    );
  };

  const updateScrollState = useCallback(() => {
    const list = historyListRef.current;

    if (!list) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      setScrollProgress(0);
      return;
    }

    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
    setCanScrollUp(list.scrollTop > 1);
    setCanScrollDown(list.scrollTop < maxScroll - 1);
    setScrollProgress(maxScroll > 0 ? list.scrollTop / maxScroll : 0);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(frame);
  }, [completedTimers.length, isAccordionOpen, updateScrollState]);

  const scrollHistory = (direction: -1 | 1) => {
    historyListRef.current?.scrollBy({
      top: direction * HISTORY_ROW_HEIGHT,
    });
  };

  const showScrollControls = completedTimers.length > 3;
  const historyHeight = Math.min(completedTimers.length, 3) * HISTORY_ROW_HEIGHT;

  return (
    <section className="timer-stack flex w-full flex-col" aria-label="Tea timer controls">
      <div
        className={`flex items-center justify-center gap-3 transition-[opacity,transform] duration-300 motion-reduce:transition-none sm:gap-4 ${
          hasActiveCountdown ? 'scale-[0.96] opacity-55' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleMinuteChange(1)}
            className="time-stepper"
            aria-label="Increase minutes"
          >
            M+
          </button>
          <div className="timer-input-digits" aria-label={`${minutes} minutes`}>
            {String(minutes).padStart(2, '0')}
          </div>
          <button
            type="button"
            onClick={() => handleMinuteChange(-1)}
            className="time-stepper"
            aria-label="Decrease minutes"
          >
            M−
          </button>
        </div>

        <span className="timer-input-separator" aria-hidden="true">
          :
        </span>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleSecondChange(10)}
            className="time-stepper"
            aria-label="Increase seconds"
          >
            S+
          </button>
          <div className="timer-input-digits" aria-label={`${seconds} seconds`}>
            {String(seconds).padStart(2, '0')}
          </div>
          <button
            type="button"
            onClick={() => handleSecondChange(-10)}
            className="time-stepper"
            aria-label="Decrease seconds"
          >
            S−
          </button>
        </div>
      </div>

      <div className="functional-block timer-actions grid w-full grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => currentDisplayTimer && handleStopTimer(currentDisplayTimer)}
          className="control-button control-button-secondary"
          disabled={!currentDisplayTimer}
        >
          Stop
        </button>
        <button
          type="button"
          onClick={handleStartTimer}
          className="control-button control-button-primary col-span-2"
          disabled={(minutes === 0 && seconds === 0) || isBrewingActive}
        >
          Start
        </button>
      </div>

      <div
        className="functional-block active-timer"
        data-phase={hasActiveCountdown ? currentDisplayTimer?.timerPhase : 'idle'}
      >
        <div ref={progressBarRef} className="active-timer-progress" aria-hidden="true" />
        <output
          className="active-timer-digits"
          aria-label={
            hasActiveCountdown && currentDisplayTimer
              ? currentDisplayTimer.timerPhase === 'cooling'
                ? `${formatTime(currentDisplayTimer.timeLeft)} overtime`
                : `${formatTime(currentDisplayTimer.timeLeft)} remaining`
              : 'No active timers'
          }
        >
          {hasActiveCountdown && currentDisplayTimer
            ? formatTime(currentDisplayTimer.timeLeft)
            : 'No active timers'}
        </output>
      </div>

      <div className="functional-block completed-section w-full">
        <button
          type="button"
          onClick={() => setIsAccordionOpen((isOpen) => !isOpen)}
          className="accordion-trigger"
          aria-expanded={isAccordionOpen}
          aria-controls="completed-timers-panel"
        >
          <svg
            viewBox="0 0 20 20"
            className={`h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
              isAccordionOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="m7 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Completed Timers — {completedTimers.length}</span>
        </button>

        {isAccordionOpen && completedTimers.length > 0 && (
          <div id="completed-timers-panel" className="history-panel">
            <div
              ref={historyListRef}
              className="history-scroll min-w-0 flex-1 overflow-y-auto"
              style={{ height: historyHeight }}
              onScroll={updateScrollState}
              tabIndex={0}
              role="region"
              aria-label="Completed timers history"
            >
              {completedTimers.map((timer) => (
                <div key={timer.id} className="history-row">
                  <span className="history-time">{timer.label}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCompleted(timer.id)}
                    className="delete-button"
                    aria-label={`Delete completed timer ${timer.label}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {showScrollControls && (
              <div className="history-scroll-controls" aria-label="History scroll controls">
                <button
                  type="button"
                  onClick={() => scrollHistory(-1)}
                  className="scroll-arrow"
                  disabled={!canScrollUp}
                  aria-label="Scroll completed timers up"
                >
                  <span aria-hidden="true">▲</span>
                </button>
                <div className="scroll-track" aria-hidden="true">
                  <span
                    className="scroll-thumb"
                    style={{ top: `${scrollProgress * 72}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => scrollHistory(1)}
                  className="scroll-arrow"
                  disabled={!canScrollDown}
                  aria-label="Scroll completed timers down"
                >
                  <span aria-hidden="true">▼</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeaTimer;
