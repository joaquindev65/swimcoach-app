import type { StrokeType, ZoneCode, ZoneConfig, PaceCalculation } from '../types/swim';

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

type ZoneDef = Omit<ZoneConfig, 'label' | 'vmPercent'>;

const ZONE_DEFS: ZoneDef[] = [
  {
    code: 'A1',
    name: 'A1',
    category: 'A1',
    minPct: 60,
    maxPct: 74,
    description: 'Aeróbico Ligero: Calentamientos, aflojes, técnica.',
    restDescription: '10 seg o más',
    defaultRestSecs: () => 15,
    energySystem: 'Aeróbico regenerativo',
  },
  {
    code: 'A2_80',
    name: 'A2',
    category: 'A2',
    minPct: 75,
    maxPct: 80,
    description: 'Aeróbico Medio: Series largas de base aeróbica y umbral.',
    restDescription: '20s en 50m, 30s en 100m, 45s en 200m',
    defaultRestSecs: (d: number) => (d <= 50 ? 20 : d <= 100 ? 30 : d <= 200 ? 45 : 60),
    energySystem: 'Glucolítico aeróbico',
  },
  {
    code: 'A2_85',
    name: 'A3',
    category: 'A2',
    minPct: 80,
    maxPct: 85,
    description: 'Aeróbico Medio Intenso: Series submáximas continuas.',
    restDescription: '20s en 50m, 30s en 100m, 45s en 200m',
    defaultRestSecs: (d: number) => (d <= 50 ? 20 : d <= 100 ? 30 : d <= 200 ? 45 : 60),
    energySystem: 'Glucolítico aeróbico',
  },
  {
    code: 'MVO2_90',
    name: 'MVO2 90',
    category: 'MVO2',
    minPct: 85,
    maxPct: 90,
    description: 'Consumo Máximo de O2: Series con mucho descanso o Broken (USRPT).',
    restDescription: 'Descanso 1 a 1 (1 ejecución a 1 descanso)',
    defaultRestSecs: (_d: number) => 60, // dinámico según tiempo de ejecución
    energySystem: 'Capacidad aeróbica máxima',
  },
  {
    code: 'MVO2_95',
    name: 'MVO2 95',
    category: 'MVO2',
    minPct: 91,
    maxPct: 95,
    description: 'Consumo Máximo de O2 Alto: Ritmos al límite del VO2 Max.',
    restDescription: 'Descanso 1 a 1 (1 ejecución a 1 descanso)',
    defaultRestSecs: (_d: number) => 60,
    energySystem: 'Capacidad aeróbica máxima',
  },
  {
    code: 'TL',
    name: 'TL',
    category: 'TL',
    minPct: 94,
    maxPct: 97,
    description: 'Tolerancia al Lactato: Series cortas con mucho descanso. Glucosa + láctico.',
    restDescription: 'Descanso 1 a 4 (1 ejecución a 4 de descanso)',
    defaultRestSecs: (_d: number) => 120, // dinámico x4
    energySystem: 'Glucólisis anaeróbica láctica',
  },
  {
    code: 'RL',
    name: 'RL',
    category: 'RL',
    minPct: 94,
    maxPct: 97,
    description: 'Resistencia al Lactato: Series cortas con descanso medio. Glucosa hasta seg 30.',
    restDescription: 'Descanso 1 a 1',
    defaultRestSecs: (_d: number) => 45,
    energySystem: 'Glucólisis anaeróbica láctica',
  },
  {
    code: 'VEL',
    name: 'VEL',
    category: 'VEL',
    minPct: 98,
    maxPct: 100,
    description: 'Velocidad Pura: Piques cortos de 15 a 25m a máxima explosividad.',
    restDescription: '2 min de descanso por cada 25m',
    defaultRestSecs: (d: number) => Math.max(120, (d / 25) * 120),
    energySystem: 'Fosfágenos (ATP-PCr)',
  },
];

/** Aplica un rango a la zona: recalcula etiqueta y porcentaje de referencia. */
const withRange = (z: ZoneDef, minPct: number, maxPct: number): ZoneConfig => ({
  ...z,
  minPct,
  maxPct,
  vmPercent: maxPct / 100,
  label: `${z.name} (${minPct}–${maxPct}%)`,
});

export const ZONES_CONFIG: ZoneConfig[] = ZONE_DEFS.map((z) => withRange(z, z.minPct, z.maxPct));

/** Nombre corto de una zona a partir de su código (ej. 'A2_85' -> 'A3'). */
export const zoneName = (code: string): string => ZONES_CONFIG.find((z) => z.code === code)?.name ?? code;

export type ZoneRanges = Partial<Record<ZoneCode, { min: number; max: number }>>;

/** Zonas por defecto con los rangos personalizados; ignora rangos inválidos. */
export function applyZoneRanges(ranges: ZoneRanges | undefined): ZoneConfig[] {
  return ZONE_DEFS.map((z) => {
    const r = ranges?.[z.code];
    const valid = r && r.min >= 1 && r.max <= 100 && r.min <= r.max;
    return valid ? withRange(z, r.min, r.max) : withRange(z, z.minPct, z.maxPct);
  });
}

/** Formatea segundos a mm:ss.cc o ss.cc */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return '--:--.--';
  }
  // Redondear el total primero: evita centésimas = 100 (ej. 26.996 -> "26.100")
  const total = Math.round(seconds * 100);
  const hundredths = (total % 100).toString().padStart(2, '0');
  const whole = Math.floor(total / 100);
  const mins = Math.floor(whole / 60);
  const secs = (whole % 60).toString().padStart(2, '0');

  return mins > 0 ? `${mins}:${secs}.${hundredths}` : `${secs}.${hundredths}s`;
}

/** Parsea "1:01.07", "26.80" o "61.07" a segundos. Devuelve null si es inválido. */
export function parseTimeToSeconds(input: string): number | null {
  const match = /^(?:(\d+):)?(\d+(?:\.\d{1,2})?)$/.exec((input ?? '').trim().replace(',', '.'));
  if (!match) return null;
  const secs = parseFloat(match[2]);
  if (match[1] !== undefined && secs >= 60) return null;
  const total = (match[1] ? parseInt(match[1], 10) * 60 : 0) + secs;
  return total > 0 ? total : null;
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
  swimmerAge: number,
  zonesConfig: ZoneConfig[] = ZONES_CONFIG
): PaceCalculation {
  const maxHR = calculateMaxHR(swimmerAge);

  // Fórmula exacta de la planilla:
  // OBJETIVO = TIEMPO_COMP * (2 - 1.03) = TIEMPO_COMP * 0.97 (-3%)
  const objectiveTime = competitionTime * 0.97;

  // INCREMENTO = TIEMPO_COMP * 3%
  const incrementTime = competitionTime * 0.03;

  // TIEMPO ENTRENAMIENTO = TIEMPO_COMP + INCREMENTO = TIEMPO_COMP * 1.03
  const trainingBaseTime = competitionTime + incrementTime;

  const zones = zonesConfig.map((config) => {
    // Fórmula de la planilla: TIEMPO_ZONA = TIEMPO_ENTRENAMIENTO * (2 - %vm)
    const factor = 2 - config.vmPercent;
    const paceTime = trainingBaseTime * factor;
    const paceSlow = trainingBaseTime * (2 - config.minPct / 100);

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
      paceSlow,
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
