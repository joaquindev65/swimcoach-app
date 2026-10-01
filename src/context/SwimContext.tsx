import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Swimmer, StrokeType, WorkoutSet } from '../types/swim';
import { DEFAULT_SWIMMERS } from '../data/defaultSwimmers';

interface SwimContextType {
  swimmers: Swimmer[];
  selectedSwimmerId: string;
  selectedSwimmer: Swimmer;
  setSelectedSwimmerId: (id: string) => void;
  addSwimmer: (swimmer: Omit<Swimmer, 'id'>) => void;
  updateSwimmer: (id: string, swimmer: Partial<Swimmer>) => void;
  deleteSwimmer: (id: string) => void;
  updatePB: (swimmerId: string, stroke: StrokeType, distance: number, timeSecs: number | null) => void;
  resetToDefaults: () => void;
  workouts: WorkoutSet[];
  addWorkoutSet: (set: Omit<WorkoutSet, 'id'>) => void;
  removeWorkoutSet: (id: string) => void;
  clearWorkout: () => void;
}

const SwimContext = createContext<SwimContextType | undefined>(undefined);

const STORAGE_KEY_SWIMMERS = 'swimcoach_swimmers_v1';
const STORAGE_KEY_WORKOUTS = 'swimcoach_workouts_v1';

export const SwimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [swimmers, setSwimmers] = useState<Swimmer[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SWIMMERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading swimmers from localStorage', e);
    }
    return DEFAULT_SWIMMERS;
  });

  const [selectedSwimmerId, setSelectedSwimmerId] = useState<string>(() => {
    return swimmers[0]?.id || DEFAULT_SWIMMERS[0].id;
  });

  const [workouts, setWorkouts] = useState<WorkoutSet[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKOUTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading workouts from localStorage', e);
    }
    return [
      {
        id: 'w-1',
        swimmerId: DEFAULT_SWIMMERS[0].id,
        stroke: 'LIBRE',
        distance: 100,
        reps: 8,
        zone: 'A2_80',
        customRestSecs: 30,
      },
      {
        id: 'w-2',
        swimmerId: DEFAULT_SWIMMERS[0].id,
        stroke: 'LIBRE',
        distance: 50,
        reps: 12,
        zone: 'MVO2_95',
        customRestSecs: 35,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SWIMMERS, JSON.stringify(swimmers));
  }, [swimmers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
  }, [workouts]);

  const selectedSwimmer = swimmers.find((s) => s.id === selectedSwimmerId) || swimmers[0] || DEFAULT_SWIMMERS[0];

  const addSwimmer = (newSwimmer: Omit<Swimmer, 'id'>) => {
    const id = 'swimmer-' + Date.now();
    const created: Swimmer = { ...newSwimmer, id };
    setSwimmers((prev) => [...prev, created]);
    setSelectedSwimmerId(id);
  };

  const updateSwimmer = (id: string, updated: Partial<Swimmer>) => {
    setSwimmers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteSwimmer = (id: string) => {
    if (swimmers.length <= 1) {
      alert('Debes mantener al menos un nadador en el equipo.');
      return;
    }
    const remaining = swimmers.filter((s) => s.id !== id);
    setSwimmers(remaining);
    if (selectedSwimmerId === id) {
      setSelectedSwimmerId(remaining[0].id);
    }
  };

  const updatePB = (swimmerId: string, stroke: StrokeType, distance: number, timeSecs: number | null) => {
    setSwimmers((prev) =>
      prev.map((s) => {
        if (s.id !== swimmerId) return s;
        const strokePbs = { ...(s.pbs[stroke] || {}) };
        if (timeSecs === null || timeSecs <= 0) {
          delete strokePbs[distance];
        } else {
          strokePbs[distance] = timeSecs;
        }
        return {
          ...s,
          pbs: {
            ...s.pbs,
            [stroke]: strokePbs,
          },
        };
      })
    );
  };

  const resetToDefaults = () => {
    if (window.confirm('¿Reiniciar a los datos originales de la planilla del entrenador?')) {
      setSwimmers(DEFAULT_SWIMMERS);
      setSelectedSwimmerId(DEFAULT_SWIMMERS[0].id);
      localStorage.removeItem(STORAGE_KEY_SWIMMERS);
      localStorage.removeItem(STORAGE_KEY_WORKOUTS);
    }
  };

  const addWorkoutSet = (newSet: Omit<WorkoutSet, 'id'>) => {
    const setWithId: WorkoutSet = { ...newSet, id: 'w-' + Date.now() };
    setWorkouts((prev) => [...prev, setWithId]);
  };

  const removeWorkoutSet = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const clearWorkout = () => {
    setWorkouts([]);
  };

  return (
    <SwimContext.Provider
      value={{
        swimmers,
        selectedSwimmerId,
        selectedSwimmer,
        setSelectedSwimmerId,
        addSwimmer,
        updateSwimmer,
        deleteSwimmer,
        updatePB,
        resetToDefaults,
        workouts,
        addWorkoutSet,
        removeWorkoutSet,
        clearWorkout,
      }}
    >
      {children}
    </SwimContext.Provider>
  );
};

export const useSwim = () => {
  const context = useContext(SwimContext);
  if (!context) {
    throw new Error('useSwim must be used within a SwimProvider');
  }
  return context;
};
