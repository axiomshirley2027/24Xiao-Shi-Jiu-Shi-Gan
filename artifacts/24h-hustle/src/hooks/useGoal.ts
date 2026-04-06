import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export interface ProgressLog {
  id: string;
  timestamp: number;
  note: string;
}

export interface GoalState {
  goal: string | null;
  deadline: number | null;
  startTime: number | null;
  logs: ProgressLog[];
  status: 'none' | 'active' | 'completed' | 'abandoned';
}

export interface GoalCtxValue {
  state: GoalState;
  setGoal: (goal: string, deadline: number) => void;
  addLog: (note: string) => void;
  completeGoal: (abandoned?: boolean) => void;
  resetGoal: () => void;
}

const STORAGE_KEY = '24h_hustle_goal_state';

const defaultState: GoalState = {
  goal: null,
  deadline: null,
  startTime: null,
  logs: [],
  status: 'none',
};

export const GoalContext = createContext<GoalCtxValue>({
  state: defaultState,
  setGoal: () => {},
  addLog: () => {},
  completeGoal: () => {},
  resetGoal: () => {},
});

export function useGoalCtx() {
  return useContext(GoalContext);
}

export function useGoal(): GoalCtxValue {
  const [state, setState] = useState<GoalState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
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
      status: 'active',
    });
  }, []);

  const addLog = useCallback((note: string) => {
    setState((prev) => ({
      ...prev,
      logs: [{ id: crypto.randomUUID(), timestamp: Date.now(), note }, ...prev.logs],
    }));
  }, []);

  const completeGoal = useCallback((abandoned = false) => {
    setState((prev) => ({ ...prev, status: abandoned ? 'abandoned' : 'completed' }));
  }, []);

  const resetGoal = useCallback(() => {
    setState(defaultState);
  }, []);

  return { state, setGoal, addLog, completeGoal, resetGoal };
}
