import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface ProgressLog {
  id: string;
  timestamp: number;
  note: string;
}

export interface DailyCheckin {
  date: string;    // "YYYY-MM-DD"
  hours: number;   // self-reported hours spent
  note?: string;
}

export interface GoalState {
  goal: string | null;
  deadline: number | null;
  startTime: number | null;
  logs: ProgressLog[];
  checkins: DailyCheckin[];
  status: 'none' | 'active' | 'completed' | 'abandoned';
}

export interface GoalCtxValue {
  state: GoalState;
  setGoal: (goal: string, deadline: number) => void;
  addLog: (note: string) => void;
  addCheckin: (date: string, hours: number, note?: string) => void;
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
  status: 'none',
};

export const GoalContext = createContext<GoalCtxValue>({
  state: defaultState,
  setGoal: () => {},
  addLog: () => {},
  addCheckin: () => {},
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
        return { checkins: [], ...parsed };
      }
    } catch {}
    return defaultState;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const setGoal = useCallback((goal: string, deadline: number) => {
    setState({
      goal,
      deadline,
      startTime: Date.now(),
      logs: [],
      checkins: [],
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

  const completeGoal = useCallback((abandoned = false) => {
    setState((prev) => ({ ...prev, status: abandoned ? 'abandoned' : 'completed' }));
  }, []);

  const resetGoal = useCallback(() => {
    setState(defaultState);
  }, []);

  return { state, setGoal, addLog, addCheckin, completeGoal, resetGoal };
}
