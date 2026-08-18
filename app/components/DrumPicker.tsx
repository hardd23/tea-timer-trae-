'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface DrumPickerProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  step?: number;
}

interface AnimationState {
  from: number;
  to: number;
  direction: 'increase' | 'decrease';
  id: number;
}

const STEP_THRESHOLD = 30;
const ANIMATION_DURATION_MS = 280;

const formatValue = (value: number) => String(value).padStart(2, '0');
const wrapValue = (value: number) => (value + 60) % 60;

export default function DrumPicker({ value, onChange, label, step = 1 }: DrumPickerProps) {
  const [animation, setAnimation] = useState<AnimationState | null>(null);
  const dragRef = useRef({ pointerId: -1, lastY: 0, remainder: 0 });
  const wheelRemainderRef = useRef(0);
  const animationTimeoutRef = useRef<number | null>(null);
  const animationIdRef = useRef(0);

  useEffect(
    () => () => {
      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    },
    [],
  );

  const changeBy = useCallback(
    (delta: number) => {
      if (delta === 0) return;

      const nextValue = wrapValue(value + delta * step);
      setAnimation({
        from: value,
        to: nextValue,
        direction: delta > 0 ? 'increase' : 'decrease',
        id: ++animationIdRef.current,
      });
      onChange(nextValue);

      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        setAnimation(null);
        animationTimeoutRef.current = null;
      }, ANIMATION_DURATION_MS);
    },
    [onChange, step, value],
  );

  const finishDrag = (element: HTMLDivElement, pointerId: number) => {
    if (element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
    dragRef.current.pointerId = -1;
    dragRef.current.remainder = 0;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      lastY: event.clientY,
      remainder: 0,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    drag.remainder += drag.lastY - event.clientY;
    drag.lastY = event.clientY;
    const steps = Math.trunc(drag.remainder / STEP_THRESHOLD);
    if (steps === 0) return;

    drag.remainder -= steps * STEP_THRESHOLD;
    changeBy(steps);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keyChanges: Record<string, number> = {
      ArrowUp: 1,
      ArrowDown: -1,
      PageUp: 5,
      PageDown: -5,
    };

    if (event.key in keyChanges) {
      event.preventDefault();
      changeBy(keyChanges[event.key]);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      changeBy(-value);
    } else if (event.key === 'End') {
      event.preventDefault();
      changeBy(59 - value);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    wheelRemainderRef.current -= event.deltaY;
    const steps = Math.trunc(wheelRemainderRef.current / STEP_THRESHOLD);
    if (steps === 0) return;

    wheelRemainderRef.current -= steps * STEP_THRESHOLD;
    changeBy(steps);
  };

  const isAnimating = animation?.to === value;

  return (
    <div className="drum-picker-group">
      <div
        className="drum-picker"
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={59}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishDrag(event.currentTarget, event.pointerId)}
        onPointerCancel={(event) => finishDrag(event.currentTarget, event.pointerId)}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      >
        {isAnimating && animation ? (
          <>
            <span
              key={`out-${animation.id}`}
              className={`drum-picker-value drum-picker-outgoing drum-picker-${animation.direction}`}
            >
              {formatValue(animation.from)}
            </span>
            <span
              key={`in-${animation.id}`}
              className={`drum-picker-value drum-picker-incoming drum-picker-${animation.direction}`}
            >
              {formatValue(animation.to)}
            </span>
          </>
        ) : (
          <span className="drum-picker-value">{formatValue(value)}</span>
        )}
      </div>
      <span className="drum-picker-label">{label}</span>
    </div>
  );
}
