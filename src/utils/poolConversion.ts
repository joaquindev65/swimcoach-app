import type { StrokeType } from '../types/swim';

export type PoolCourse = 'SCM' | 'LCM' | 'SCY';

export interface PoolConfig {
  code: PoolCourse;
  label: string;
  unit: string;
  lengthMeters: number;
}

export const POOL_TYPES: Record<PoolCourse, PoolConfig> = {
  SCM: {
    code: 'SCM',
    label: '25 Metros (Pileta Corta)',
    unit: 'm',
    lengthMeters: 25,
  },
  LCM: {
    code: 'LCM',
    label: '50 Metros (Pileta Olímpica)',
    unit: 'm',
    lengthMeters: 50,
  },
  SCY: {
    code: 'SCY',
    label: '25 Yardas (Pileta Americana)',
    unit: 'yd',
    lengthMeters: 22.86, // 25 yards in meters
  },
};

/**
 * Diferencia en segundos añadida al pasar de 25m (SCM) a 50m (LCM)
 * debido al menor número de virajes / empujes de pared (World Aquatics / FINA Standard).
 */
const SCM_TO_LCM_DELTA: Record<StrokeType, Record<number, number>> = {
  LIBRE: {
    50: 0.80,
    100: 1.60,
    200: 3.20,
    400: 6.40,
    800: 13.00,
    1500: 25.00,
  },
  ESPALDA: {
    50: 0.90,
    100: 1.80,
    200: 3.60,
  },
  PECHO: {
    50: 1.10,
    100: 2.20,
    200: 4.40,
  },
  MARIPOSA: {
    50: 0.70,
    100: 1.50,
    200: 3.00,
  },
  COMBINADO: {
    100: 1.60,
    200: 3.40,
    400: 7.00,
  },
};

// Factor estándar de conversión métrico / yardas (NCAA & Swimming World)
const SCY_TO_SCM_FACTOR = 1.110;

/**
 * Obtiene el delta SCM -> LCM para un estilo y distancia dados.
 */
export const getScmToLcmDelta = (stroke: StrokeType, distance: number): number => {
  const strokeMap = SCM_TO_LCM_DELTA[stroke];
  if (strokeMap && strokeMap[distance] !== undefined) {
    return strokeMap[distance];
  }
  // Estimación lineal si la distancia no está en la tabla (aprox 0.80s por cada 50m)
  return (distance / 50) * 0.80;
};

/**
 * Convierte un tiempo entre dos tipos de piscina (SCM 25m, LCM 50m, SCY 25yd).
 *
 * @param timeSeconds Tiempo original en segundos
 * @param fromCourse Piscina de origen
 * @param toCourse Piscina de destino
 * @param stroke Estilo de nado
 * @param distance Distancia de la prueba
 * @returns Tiempo convertido en segundos
 */
export const convertPoolTime = (
  timeSeconds: number,
  fromCourse: PoolCourse,
  toCourse: PoolCourse,
  stroke: StrokeType = 'LIBRE',
  distance: number = 100
): number => {
  if (fromCourse === toCourse || timeSeconds <= 0) {
    return timeSeconds;
  }

  const delta = getScmToLcmDelta(stroke, distance);

  // Paso 1: Convertir de fromCourse a SCM (base 25m)
  let scmTime = timeSeconds;
  if (fromCourse === 'LCM') {
    scmTime = Math.max(1, timeSeconds - delta);
  } else if (fromCourse === 'SCY') {
    scmTime = timeSeconds * SCY_TO_SCM_FACTOR;
  }

  // Paso 2: Convertir de SCM a toCourse
  if (toCourse === 'SCM') {
    return Math.round(scmTime * 100) / 100;
  } else if (toCourse === 'LCM') {
    return Math.round((scmTime + delta) * 100) / 100;
  } else if (toCourse === 'SCY') {
    return Math.round((scmTime / SCY_TO_SCM_FACTOR) * 100) / 100;
  }

  return timeSeconds;
};

/**
 * Calcula la matriz completa de conversión para un tiempo base
 */
export const calculateAllPoolTimes = (
  timeSeconds: number,
  baseCourse: PoolCourse,
  stroke: StrokeType,
  distance: number
) => {
  return {
    scm: convertPoolTime(timeSeconds, baseCourse, 'SCM', stroke, distance),
    lcm: convertPoolTime(timeSeconds, baseCourse, 'LCM', stroke, distance),
    scy: convertPoolTime(timeSeconds, baseCourse, 'SCY', stroke, distance),
  };
};
