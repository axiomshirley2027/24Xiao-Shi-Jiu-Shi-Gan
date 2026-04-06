import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface ProgressLog {
  id: string;
  timestamp: number;
  note: string;
}

export interface DailyCheckin {
  date: string;
  hours: number;
  note?: string;
}

export interface GoalState {
  goal: string | null;
  deadline: number | null;
  startTime: number | null;
  logs: ProgressLog[];
  checkins: DailyCheckin[];
  stake: string | null;
  distractionCount: number;
  reminderTimes: string[];
  pomodoroCount: number;
  estimatedHours: number | null;
  status: 'none' | 'active' | 'editing' | 'completed' | 'abandoned';
}

export interface GoalCtxValue {
  state: GoalState;
  setGoal: (goal: string, deadline: number, opts?: { stake?: string; reminderTimes?: string[]; estimatedHours?: number }) => void;
  updateGoal: (goal: string, deadline: number, opts?: { stake?: string; reminderTimes?: string[]; estimatedHours?: number }) => void;
  editGoal: () => void;
  addLog: (note: string) => void;
  addCheckin: (date: string, hours: number, note?: string) => void;
  addDistraction: () => void;
  incrementPomodoro: () => void;
  completeGoal: (abandoned?: boolean) => void;
  resetGoal: () => void;
}

const STORAGE_KEY = '24h_hustle_goal_state';

const defaultState: GoalState = {
  goal: null,
  deadline: null,
  startTime: null,
  logs: [],
  checkins: [],
  stake: null,
  distractionCount: 0,
  reminderTimes: [],
  pomodoroCount: 0,
  estimatedHours: null,
  status: 'none',
};

export const GoalContext = createContext<GoalCtxValue>({
  state: defaultState,
  setGoal: () => {},
  updateGoal: () => {},
  editGoal: () => {},
  addLog: () => {},
  addCheckin: () => {},
  addDistraction: () => {},
  incrementPomodoro: () => {},
  completeGoal: () => {},
  resetGoal: () => {},
});

export function useGoalCtx() {
  return useContext(GoalContext);
}

export function getDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function calcStreak(checkins: DailyCheckin[]): number {
  const byDate: Record<string, number> = {};
  for (const c of checkins) byDate[c.date] = c.hours;

  const today = new Date();
  const todayStr = getDateStr(today);

  let cursor = new Date(today);
  if ((byDate[todayStr] ?? 0) < 12) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  for (let i = 0; i < 999; i++) {
    const dateStr = getDateStr(cursor);
    if ((byDate[dateStr] ?? 0) < 12) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useGoal(): GoalCtxValue {
  const [state, setState] = useState<GoalState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultState, ...parsed };
      }
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setGoal = useCallback((goal: string, deadline: number, opts?: { stake?: string; reminderTimes?: string[]; estimatedHours?: number }) => {
    setState({
      ...defaultState,
      goal,
      deadline,
      startTime: Date.now(),
      stake: opts?.stake ?? null,
      reminderTimes: opts?.reminderTimes ?? [],
      estimatedHours: opts?.estimatedHours ?? null,
      status: 'active',
    });
  }, []);

  const addLog = useCallback((note: string) => {
    setState((prev) => ({
      ...prev,
      logs: [{ id: crypto.randomUUID(), timestamp: Date.now(), note }, ...prev.logs],
    }));
  }, []);

  const addCheckin = useCallback((date: string, hours: number, note?: string) => {
    setState((prev) => {
      const filtered = prev.checkins.filter((c) => c.date !== date);
      return { ...prev, checkins: [...filtered, { date, hours, note }] };
    });
  }, []);

  const addDistraction = useCallback(() => {
    setState((prev) => ({ ...prev, distractionCount: prev.distractionCount + 1 }));
  }, []);

  const incrementPomodoro = useCallback(() => {
    setState((prev) => ({ ...prev, pomodoroCount: prev.pomodoroCount + 1 }));
  }, []);

  const completeGoal = useCallback((abandoned = false) => {
    setState((prev) => ({ ...prev, status: abandoned ? 'abandoned' : 'completed' }));
  }, []);

  const editGoal = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'editing' }));
  }, []);

  const updateGoal = useCallback((goal: string, deadline: number, opts?: { stake?: string; reminderTimes?: string[]; estimatedHours?: number }) => {
    setState((prev) => ({
      ...prev,
      goal,
      deadline,
      stake: opts?.stake ?? null,
      reminderTimes: opts?.reminderTimes ?? [],
      estimatedHours: opts?.estimatedHours ?? null,
      status: 'active',
    }));
  }, []);

  const resetGoal = useCallback(() => {
    setState(defaultState);
  }, []);

  return { state, setGoal, updateGoal, editGoal, addLog, addCheckin, addDistraction, incrementPomodoro, completeGoal, resetGoal };
}
