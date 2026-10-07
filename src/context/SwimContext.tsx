import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Swimmer,
  StrokeType,
  WorkoutSet,
  SavedWorkout,
  WorkoutCategory,
  UserProfile,
  UserRole,
} from '../types/swim';
import { DEFAULT_SWIMMERS } from '../data/defaultSwimmers';
import { DEFAULT_WORKOUT_TEMPLATES } from '../data/defaultWorkouts';

export const DEFAULT_COACH_PROFILE: UserProfile = {
  id: 'coach-1',
  name: 'Coach Joaquín',
  role: 'coach',
  clubName: 'Club Natación Competitiva',
  title: 'Entrenador Principal',
  createdAt: new Date().toISOString(),
};

interface SwimContextType {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  login: (profile: Partial<UserProfile> & { name: string; role: UserRole }) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
  switchRole: (role: UserRole, swimmerId?: string) => void;
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
  savedWorkouts: SavedWorkout[];
  saveCurrentWorkout: (title: string, description?: string, category?: WorkoutCategory) => SavedWorkout;
  loadSavedWorkout: (savedId: string) => void;
  deleteSavedWorkout: (id: string) => void;
  exportBackup: () => void;
  importBackup: (jsonContent: string) => { success: boolean; message: string };
}

const SwimContext = createContext<SwimContextType | undefined>(undefined);

const STORAGE_KEY_SWIMMERS = 'swimcoach_swimmers_v1';
const STORAGE_KEY_WORKOUTS = 'swimcoach_workouts_v1';
const STORAGE_KEY_SAVED_WORKOUTS = 'swimcoach_saved_workouts_v1';
const STORAGE_KEY_USER = 'swimcoach_user_session_v1';


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

  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_WORKOUTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading saved workouts from localStorage', e);
    }
    return DEFAULT_WORKOUT_TEMPLATES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && parsed.role) return parsed;
      }
    } catch (e) {
      console.error('Error loading user session from localStorage', e);
    }
    return DEFAULT_COACH_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SWIMMERS, JSON.stringify(swimmers));
  }, [swimmers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SAVED_WORKOUTS, JSON.stringify(savedWorkouts));
  }, [savedWorkouts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [currentUser]);

  const login = (profile: Partial<UserProfile> & { name: string; role: UserRole }) => {
    const user: UserProfile = {
      id: profile.id || (profile.role === 'coach' ? 'coach-' + Date.now() : 'swimmer-' + Date.now()),
      name: profile.name.trim(),
      role: profile.role,
      clubName: profile.clubName?.trim() || 'Club Natación Competitiva',
      title: profile.title || (profile.role === 'coach' ? 'Entrenador Principal' : 'Nadador Federado'),
      email: profile.email?.trim(),
      avatarUrl: profile.avatarUrl,
      swimmerId: profile.swimmerId,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(user);
    if (user.role === 'swimmer' && user.swimmerId) {
      setSelectedSwimmerId(user.swimmerId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const switchRole = (newRole: UserRole, targetSwimmerId?: string) => {
    if (newRole === 'swimmer') {
      const s = swimmers.find((sw) => sw.id === targetSwimmerId) || swimmers[0];
      const swimmerProfile: UserProfile = {
        id: 'user-' + (s ? s.id : 'swimmer'),
        name: s ? s.name : 'Nadador',
        role: 'swimmer',
        clubName: currentUser?.clubName || 'Club Natación Competitiva',
        title: 'Nadador Federado',
        avatarUrl: s?.photoUrl,
        swimmerId: s?.id,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(swimmerProfile);
      if (s) setSelectedSwimmerId(s.id);
    } else {
      const coachProfile: UserProfile = {
        id: 'coach-1',
        name: currentUser?.role === 'coach' ? currentUser.name : 'Coach Joaquín',
        role: 'coach',
        clubName: currentUser?.clubName || 'Club Natación Competitiva',
        title: 'Entrenador Principal',
        avatarUrl: currentUser?.avatarUrl,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(coachProfile);
    }
  };

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
      setSavedWorkouts(DEFAULT_WORKOUT_TEMPLATES);
      localStorage.removeItem(STORAGE_KEY_SWIMMERS);
      localStorage.removeItem(STORAGE_KEY_WORKOUTS);
      localStorage.removeItem(STORAGE_KEY_SAVED_WORKOUTS);
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

  // Workout Library methods
  const saveCurrentWorkout = (
    title: string,
    description?: string,
    category?: WorkoutCategory
  ): SavedWorkout => {
    const totalMeters = workouts.reduce((acc, curr) => acc + curr.reps * curr.distance, 0);
    const newSaved: SavedWorkout = {
      id: 'saved-' + Date.now(),
      title: title.trim() || `Entrenamiento ${new Date().toLocaleDateString()}`,
      description: description?.trim(),
      category: category || 'Mixto',
      createdAt: new Date().toISOString(),
      totalMeters,
      sets: workouts.map((w) => ({
        swimmerId: '',
        stroke: w.stroke,
        distance: w.distance,
        reps: w.reps,
        zone: w.zone,
        customRestSecs: w.customRestSecs,
      })),
    };

    setSavedWorkouts((prev) => [newSaved, ...prev]);
    return newSaved;
  };

  const loadSavedWorkout = (savedId: string) => {
    const saved = savedWorkouts.find((sw) => sw.id === savedId);
    if (!saved) return;

    const newSets: WorkoutSet[] = saved.sets.map((s, idx) => ({
      ...s,
      id: `w-${Date.now()}-${idx}`,
      swimmerId: selectedSwimmer.id,
    }));

    setWorkouts(newSets);
  };

  const deleteSavedWorkout = (id: string) => {
    setSavedWorkouts((prev) => prev.filter((sw) => sw.id !== id));
  };

  // Backup methods
  const exportBackup = () => {
    const backupData = {
      app: 'SwimCoach Pro',
      version: 1,
      exportedAt: new Date().toISOString(),
      swimmers,
      workouts,
      savedWorkouts,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `swimcoach_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonContent: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonContent);

      if (!data || !Array.isArray(data.swimmers) || data.swimmers.length === 0) {
        return {
          success: false,
          message: 'El archivo no contiene un listado válido de nadadores de SwimCoach.',
        };
      }

      setSwimmers(data.swimmers);
      if (data.swimmers[0]) {
        setSelectedSwimmerId(data.swimmers[0].id);
      }

      if (Array.isArray(data.workouts)) {
        setWorkouts(data.workouts);
      }

      if (Array.isArray(data.savedWorkouts) && data.savedWorkouts.length > 0) {
        setSavedWorkouts(data.savedWorkouts);
      }

      return {
        success: true,
        message: `¡Copia restaurada exitosamente! Se importaron ${data.swimmers.length} nadador(es).`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al procesar el archivo JSON: ${err?.message || 'Formato inválido'}`,
      };
    }
  };

  return (
    <SwimContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        logout,
        updateCurrentUser,
        switchRole,
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
        savedWorkouts,
        saveCurrentWorkout,
        loadSavedWorkout,
        deleteSavedWorkout,
        exportBackup,
        importBackup,
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
