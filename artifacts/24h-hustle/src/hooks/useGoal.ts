import { useState, useEffect, useCallback } from 'react';

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

const STORAGE_KEY = '24h_hustle_goal_state';

const defaultState: GoalState = {
  goal: null,
  deadline: null,
  startTime: null,
  logs: [],
  status: 'none',
};

export function useGoal() {
  const [state, setState] = useState<GoalState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse goal state from local storage', e);
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
      logs: [
        { id: crypto.randomUUID(), timestamp: Date.now(), note },
        ...prev.logs,
      ],
    }));
  }, []);

  const completeGoal = useCallback((abandoned: boolean = false) => {
    setState((prev) => ({
      ...prev,
      status: abandoned ? 'abandoned' : 'completed',
    }));
  }, []);

  const resetGoal = useCallback(() => {
    setState(defaultState);
  }, []);

  return {
    state,
    setGoal,
    addLog,
    completeGoal,
    resetGoal,
  };
}
