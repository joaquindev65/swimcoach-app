import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Swimmer,
  StrokeType,
  WorkoutSet,
  SavedWorkout,
  WorkoutCategory,
  UserProfile,
  UserRole,
  ZoneCode,
  ZoneConfig,
} from '../types/swim';
import { applyZoneRanges, type ZoneRanges } from '../utils/swimCalculations';
import { DEFAULT_SWIMMERS } from '../data/defaultSwimmers';
import { DEFAULT_WORKOUT_TEMPLATES } from '../data/defaultWorkouts';
import { addHistory } from '../utils/history';

export const DEFAULT_COACH_PROFILE: UserProfile = {
  id: 'coach-1',
  name: 'Coach Joaquín',
  role: 'coach',
  clubName: 'Club Natación Competitiva',
  sede: 'Sede Central',
  title: 'Entrenador Principal',
  createdAt: new Date().toISOString(),
};


interface SwimContextType {
  currentUser: UserProfile | null;
  storageError: boolean;
  zones: ZoneConfig[];
  setZoneRange: (code: ZoneCode, min: number, max: number) => void;
  resetZoneRanges: () => void;
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
const STORAGE_KEY_COACH = 'swimcoach_coach_profile_v1';
const STORAGE_KEY_ZONES = 'swimcoach_zone_ranges_v1';

/** Guarda en localStorage sin romper la app si está lleno o bloqueado. */
const save = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Error saving to localStorage', key, e);
    return false;
  }
};

const isValidSwimmer = (s: any): s is Swimmer =>
  !!s &&
  typeof s.id === 'string' &&
  typeof s.name === 'string' &&
  typeof s.age === 'number' &&
  !!s.pbs &&
  typeof s.pbs === 'object';


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

  // Un nadador que recarga debe seguir viendo sus propios datos
  const [selectedSwimmerId, setSelectedSwimmerId] = useState<string>(() => {
    const own = currentUser?.swimmerId;
    if (own && swimmers.some((s) => s.id === own)) return own;
    return swimmers[0]?.id || DEFAULT_SWIMMERS[0].id;
  });

  const [zoneRanges, setZoneRanges] = useState<ZoneRanges>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY_ZONES) || 'null');
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      console.error('Error loading zone ranges from localStorage', e);
    }
    return {};
  });
  const zones = useMemo(() => applyZoneRanges(zoneRanges), [zoneRanges]);

  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const results = [
      save(STORAGE_KEY_SWIMMERS, swimmers),
      save(STORAGE_KEY_WORKOUTS, workouts),
      save(STORAGE_KEY_SAVED_WORKOUTS, savedWorkouts),
      save(STORAGE_KEY_ZONES, zoneRanges),
    ];
    if (currentUser) {
      results.push(save(STORAGE_KEY_USER, currentUser));
      if (currentUser.role === 'coach') results.push(save(STORAGE_KEY_COACH, currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    setStorageError(results.includes(false));
  }, [swimmers, workouts, savedWorkouts, zoneRanges, currentUser]);

  const login = (profile: Partial<UserProfile> & { name: string; role: UserRole }) => {
    const user: UserProfile = {
      id: profile.id || (profile.role === 'coach' ? 'coach-' + Date.now() : 'swimmer-' + Date.now()),
      name: profile.name.trim(),
      role: profile.role,
      clubName: profile.clubName?.trim() || 'Club Natación Competitiva',
      sede: profile.sede?.trim() || 'Sede Central',
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
        clubName: s?.club || currentUser?.clubName || 'Club Natación Competitiva',
        sede: s?.sede || currentUser?.sede || 'Sede Central',
        title: 'Nadador Federado',
        avatarUrl: s?.photoUrl,
        swimmerId: s?.id,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(swimmerProfile);
      if (s) setSelectedSwimmerId(s.id);
    } else {
      // Restaura el último perfil de coach guardado (no el de nadador)
      let coachProfile = DEFAULT_COACH_PROFILE;
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_COACH) || 'null');
        if (stored?.role === 'coach' && stored.name) coachProfile = stored;
      } catch (e) {
        console.error('Error loading coach profile from localStorage', e);
      }
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
    if (currentUser?.swimmerId === id) switchRole('coach');
  };

  const updatePB = (swimmerId: string, stroke: StrokeType, distance: number, timeSecs: number | null) => {
    setSwimmers((prev) =>
      prev.map((s) => {
        if (s.id !== swimmerId) return s;
        const strokePbs = { ...(s.pbs[stroke] || {}) };
        let history = s.history;
        if (timeSecs === null || timeSecs <= 0) {
          delete strokePbs[distance];
        } else {
          strokePbs[distance] = timeSecs;
          // 'sv-SE' da YYYY-MM-DD en hora local
          history = addHistory(history, { stroke, distance, time: timeSecs, date: new Date().toLocaleDateString('sv-SE') });
        }
        return {
          ...s,
          history,
          pbs: {
            ...s.pbs,
            [stroke]: strokePbs,
          },
        };
      })
    );
  };

  const setZoneRange = (code: ZoneCode, min: number, max: number) => {
    setZoneRanges((prev) => ({ ...prev, [code]: { min, max } }));
  };

  const resetZoneRanges = () => setZoneRanges({});

  const resetToDefaults = () => {
    if (window.confirm('¿Reiniciar a los datos originales de la planilla del entrenador?')) {
      setSwimmers(DEFAULT_SWIMMERS);
      setSelectedSwimmerId(DEFAULT_SWIMMERS[0].id);
      setSavedWorkouts(DEFAULT_WORKOUT_TEMPLATES);
      setWorkouts([]);
      resetZoneRanges();
      if (currentUser?.swimmerId) switchRole('coach');
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
      zoneRanges,
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

      if (
        !data ||
        !Array.isArray(data.swimmers) ||
        data.swimmers.length === 0 ||
        !data.swimmers.every(isValidSwimmer)
      ) {
        return {
          success: false,
          message: 'El archivo no contiene un listado válido de nadadores de SwimCoach.',
        };
      }
      if (
        (data.workouts !== undefined && !Array.isArray(data.workouts)) ||
        (data.savedWorkouts !== undefined && !Array.isArray(data.savedWorkouts))
      ) {
        return { success: false, message: 'El archivo tiene entrenamientos con formato inválido.' };
      }

      setSwimmers(data.swimmers);
      setSelectedSwimmerId(data.swimmers[0].id);
      if (currentUser?.swimmerId && !data.swimmers.some((s: Swimmer) => s.id === currentUser.swimmerId)) {
        switchRole('coach');
      }

      if (Array.isArray(data.workouts)) {
        setWorkouts(data.workouts);
      }

      // applyZoneRanges descarta rangos inválidos
      setZoneRanges(data.zoneRanges && typeof data.zoneRanges === 'object' ? data.zoneRanges : {});

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
        storageError,
        zones,
        setZoneRange,
        resetZoneRanges,
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
