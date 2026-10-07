export type StrokeType = 'LIBRE' | 'PECHO' | 'ESPALDA' | 'MARIPOSA' | 'COMBINADO';

export type ZoneCode = 'A1' | 'A2_80' | 'A2_85' | 'MVO2_90' | 'MVO2_95' | 'TL' | 'RL' | 'VEL';

export interface ZoneConfig {
  code: ZoneCode;
  label: string;
  category: 'A1' | 'A2' | 'MVO2' | 'TL' | 'RL' | 'VEL';
  vmPercent: number; // e.g. 0.80, 0.85, 0.90, 0.95, 0.97, 1.00
  description: string;
  restDescription: string;
  defaultRestSecs: (distance: number) => number;
  energySystem: string;
}

export interface Swimmer {
  id: string;
  name: string;
  age: number;
  category?: string;
  notes?: string;
  photoUrl?: string; // Data URL o URL de imagen de perfil
  // Personal Bests: times in seconds keyed by stroke and distance
  // e.g. pbs['LIBRE'][100] = 61.07
  pbs: Partial<Record<StrokeType, Record<number, number>>>;
}

export interface PaceCalculation {
  distance: number;
  stroke: StrokeType;
  competitionTime: number; // T_comp
  objectiveTime: number;   // -3%
  incrementTime: number;   // +3% increment
  trainingBaseTime: number;// T_comp + Increment
  zones: {
    config: ZoneConfig;
    paceTime: number;      // T_base * (2 - vm)
    bpm: number;           // (220 - age) * vm
    pulse5s: number;       // bpm / 12
    restSecs: number;
  }[];
}

export interface WorkoutSet {
  id: string;
  swimmerId: string;
  stroke: StrokeType;
  distance: number;
  reps: number;
  zone: ZoneCode;
  customRestSecs?: number;
}

export type WorkoutCategory = 'Aeróbico A1/A2' | 'MVO2' | 'Láctico / Tolerancia' | 'Velocidad' | 'Mixto';

export interface SavedWorkout {
  id: string;
  title: string;
  description?: string;
  category?: WorkoutCategory;
  createdAt: string; // ISO date string
  sets: Omit<WorkoutSet, 'id'>[];
  totalMeters: number;
}

export interface MultiLaneSlot {
  id: string;
  laneNumber: number;
  swimmerId: string;
  stroke: StrokeType;
  distance: number;
  zone: ZoneCode;
  laps: number[]; // recorded split times in seconds
}

export type UserRole = 'coach' | 'swimmer';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  clubName: string;
  title?: string;
  avatarUrl?: string;
  swimmerId?: string; // Si el rol es 'swimmer', ID del nadador vinculado
  createdAt?: string;
}

