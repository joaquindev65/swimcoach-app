import type { StrokeType, ZoneConfig, PaceCalculation } from '../types/swim';

export const STROKES: { type: StrokeType; label: string; icon: string }[] = [
  { type: 'LIBRE', label: 'Crawl / Libre', icon: '🏊' },
  { type: 'PECHO', label: 'Pecho / Braza', icon: '🐸' },
  { type: 'ESPALDA', label: 'Espalda', icon: '🌊' },
  { type: 'MARIPOSA', label: 'Mariposa', icon: '🦋' },
  { type: 'COMBINADO', label: 'Combinado (IM)', icon: '⚡' },
];

export const STROKE_DISTANCES: Record<StrokeType, number[]> = {
  LIBRE: [50, 100, 200, 400, 800, 1500],
  PECHO: [50, 100, 200],
  ESPALDA: [50, 100, 200],
  MARIPOSA: [50, 100, 200],
  COMBINADO: [100, 200, 400],
};

export const ZONES_CONFIG: ZoneConfig[] = [
  {
    code: 'A1',
    label: 'A1 (<80%)',
    category: 'A1',
    vmPercent: 0.75,
    description: 'Aeróbico Ligero: Calentamientos, aflojes, técnica.',
    restDescription: '10 seg o más',
    defaultRestSecs: () => 15,
    energySystem: 'Aeróbico regenerativo',
  },
  {
    code: 'A2_80',
    label: 'A2 (80%)',
    category: 'A2',
    vmPercent: 0.80,
    description: 'Aeróbico Medio: Series largas de base aeróbica y umbral.',
    restDescription: '20s en 50m, 30s en 100m, 45s en 200m',
    defaultRestSecs: (d: number) => (d <= 50 ? 20 : d <= 100 ? 30 : d <= 200 ? 45 : 60),
    energySystem: 'Glucolítico aeróbico',
  },
  {
    code: 'A2_85',
    label: 'A2 (85%)',
    category: 'A2',
    vmPercent: 0.85,
    description: 'Aeróbico Medio Intenso: Series submáximas continuas.',
    restDescription: '20s en 50m, 30s en 100m, 45s en 200m',
    defaultRestSecs: (d: number) => (d <= 50 ? 20 : d <= 100 ? 30 : d <= 200 ? 45 : 60),
    energySystem: 'Glucolítico aeróbico',
  },
  {
    code: 'MVO2_90',
    label: 'MVO2 (90%)',
    category: 'MVO2',
    vmPercent: 0.90,
    description: 'Consumo Máximo de O2: Series con mucho descanso o Broken (USRPT).',
    restDescription: 'Descanso 1 a 1 (1 ejecución a 1 descanso)',
    defaultRestSecs: (_d: number) => 60, // dinámico según tiempo de ejecución
    energySystem: 'Capacidad aeróbica máxima',
  },
  {
    code: 'MVO2_95',
    label: 'MVO2 (95%)',
    category: 'MVO2',
    vmPercent: 0.95,
    description: 'Consumo Máximo de O2 Alto: Ritmos al límite del VO2 Max.',
    restDescription: 'Descanso 1 a 1 (1 ejecución a 1 descanso)',
    defaultRestSecs: (_d: number) => 60,
    energySystem: 'Capacidad aeróbica máxima',
  },
  {
    code: 'TL',
    label: 'TL (97%-100%)',
    category: 'TL',
    vmPercent: 0.97,
    description: 'Tolerancia al Lactato: Series cortas con mucho descanso. Glucosa + láctico.',
    restDescription: 'Descanso 1 a 4 (1 ejecución a 4 de descanso)',
    defaultRestSecs: (_d: number) => 120, // dinámico x4
    energySystem: 'Glucólisis anaeróbica láctica',
  },
  {
    code: 'RL',
    label: 'RL (97%-100%)',
    category: 'RL',
    vmPercent: 0.97,
    description: 'Resistencia al Lactato: Series cortas con descanso medio. Glucosa hasta seg 30.',
    restDescription: 'Descanso 1 a 1',
    defaultRestSecs: (_d: number) => 45,
    energySystem: 'Glucólisis anaeróbica láctica',
  },
  {
    code: 'VEL',
    label: 'VEL (100%)',
    category: 'VEL',
    vmPercent: 1.00,
    description: 'Velocidad Pura: Piques cortos de 15 a 25m a máxima explosividad.',
    restDescription: '2 min de descanso por cada 25m',
    defaultRestSecs: (d: number) => Math.max(120, (d / 25) * 120),
    energySystem: 'Fosfágenos (ATP-PCr)',
  },
];

/** Formatea segundos a mm:ss.cc o ss.cc */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return '--:--.--';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const wholeSecs = Math.floor(secs);
  const hundredths = Math.round((secs - wholeSecs) * 100);

  const formattedSecs = wholeSecs.toString().padStart(2, '0');
  const formattedHundredths = hundredths.toString().padStart(2, '0');

  if (mins > 0) {
    return `${mins}:${formattedSecs}.${formattedHundredths}`;
  }
  return `${formattedSecs}.${formattedHundredths}s`;
}

/** Parsea un string tipo "1:01.07" o "26.80" o "61.07" a segundos */
export function parseTimeToSeconds(input: string): number | null {
  if (!input) return null;
  const clean = input.trim().replace(',', '.');
  
  if (clean.includes(':')) {
    const parts = clean.split(':');
    const mins = parseFloat(parts[0]);
    const secs = parseFloat(parts[1]);
    if (isNaN(mins) || isNaN(secs)) return null;
    return mins * 60 + secs;
  }
  
  const secs = parseFloat(clean);
  if (isNaN(secs) || secs <= 0) return null;
  return secs;
}

/** Calcula FC máxima: 220 - edad */
export function calculateMaxHR(age: number): number {
  return Math.max(100, 220 - age);
}

/** Calcula pulsaciones por zona */
export function calculateZoneHR(maxHR: number, vmPercent: number): { bpm: number; pulse5s: number } {
  const bpm = Math.round(maxHR * vmPercent * 10) / 10;
  const pulse5s = Math.round((bpm / 12) * 10) / 10;
  return { bpm, pulse5s };
}

/** Realiza el cálculo completo idéntico al Excel de tu entrenador */
export function calculatePacesForDistance(
  competitionTime: number,
  distance: number,
  stroke: StrokeType,
  swimmerAge: number
): PaceCalculation {
  const maxHR = calculateMaxHR(swimmerAge);

  // Fórmula exacta de la planilla:
  // OBJETIVO = TIEMPO_COMP * (2 - 1.03) = TIEMPO_COMP * 0.97 (-3%)
  const objectiveTime = competitionTime * 0.97;

  // INCREMENTO = TIEMPO_COMP * 3%
  const incrementTime = competitionTime * 0.03;

  // TIEMPO ENTRENAMIENTO = TIEMPO_COMP + INCREMENTO = TIEMPO_COMP * 1.03
  const trainingBaseTime = competitionTime + incrementTime;

  const zones = ZONES_CONFIG.map((config) => {
    // Fórmula de la planilla: TIEMPO_ZONA = TIEMPO_ENTRENAMIENTO * (2 - %vm)
    const factor = 2 - config.vmPercent;
    const paceTime = trainingBaseTime * factor;

    // Frecuencia cardíaca y pulso en 5 segundos
    const { bpm, pulse5s } = calculateZoneHR(maxHR, config.vmPercent);

    // Descanso
    let restSecs = config.defaultRestSecs(distance);
    if (config.category === 'MVO2' || config.code === 'RL') {
      restSecs = Math.round(paceTime); // 1 a 1
    } else if (config.category === 'TL') {
      restSecs = Math.round(paceTime * 4); // 1 a 4
    }

    return {
      config,
      paceTime,
      bpm,
      pulse5s,
      restSecs,
    };
  });

  return {
    distance,
    stroke,
    competitionTime,
    objectiveTime,
    incrementTime,
    trainingBaseTime,
    zones,
  };
}
