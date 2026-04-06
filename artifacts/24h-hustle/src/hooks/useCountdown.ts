import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSecondsRemaining: number;
  totalDurationSeconds: number;
  progressPercent: number;
  isLowTime: boolean;
  isExpired: boolean;
}

export function useCountdown(startTime: number | null, deadline: number | null): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline || !startTime) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSecondsRemaining: 0,
      totalDurationSeconds: 1,
      progressPercent: 0,
      isLowTime: false,
      isExpired: false,
    };
  }

  const totalDurationSeconds = Math.max(1, Math.floor((deadline - startTime) / 1000));
  const remainingSeconds = Math.max(0, Math.floor((deadline - now) / 1000));
  
  const elapsedSeconds = totalDurationSeconds - remainingSeconds;
  const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));

  const isLowTime = remainingSeconds > 0 && remainingSeconds < totalDurationSeconds * 0.1; // Less than 10% remaining
  const isExpired = remainingSeconds <= 0;

  const days = Math.floor(remainingSeconds / (3600 * 24));
  const hours = Math.floor((remainingSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSecondsRemaining: remainingSeconds,
    totalDurationSeconds,
    progressPercent,
    isLowTime,
    isExpired,
  };
}
