import type { Swimmer } from '../types/swim';

export const DEFAULT_SWIMMERS: Swimmer[] = [
  {
    id: 'swimmer-1',
    name: 'Joaquín (Planilla Coach)',
    age: 33,
    category: 'Master / Primera',
    notes: 'Datos importados directamente de la planilla del entrenador.',
    pbs: {
      LIBRE: {
        50: 26.80,
        100: 61.07,
        200: 137.59,
        400: 303.20,
        800: 608.32,
        1500: 1266.70,
      },
      PECHO: {
        50: 39.16,
        100: 81.89,
        200: 178.21,
      },
      ESPALDA: {
        50: 36.59,
        100: 79.31,
        200: 168.30,
      },
      MARIPOSA: {
        50: 29.00,
        100: 71.20,
        200: 156.87,
      },
      COMBINADO: {
        100: 73.03,
        200: 154.01,
        400: 332.70,
      },
    },
  },
  {
    id: 'swimmer-2',
    name: 'Sofía Martínez',
    age: 20,
    category: 'Juvenil / Primera',
    notes: 'Especialista en Libre medio fondo y Combinado.',
    pbs: {
      LIBRE: {
        50: 27.50,
        100: 59.80,
        200: 131.20,
        400: 285.40,
      },
      MARIPOSA: {
        50: 29.80,
        100: 66.50,
      },
      COMBINADO: {
        200: 147.10,
        400: 315.80,
      },
    },
  },
  {
    id: 'swimmer-3',
    name: 'Lucas Benítez',
    age: 17,
    category: 'Cadete / Juvenil',
    notes: 'Velocista puro (50m y 100m Libre/Mariposa).',
    pbs: {
      LIBRE: {
        50: 24.90,
        100: 54.30,
      },
      MARIPOSA: {
        50: 26.10,
        100: 58.40,
      },
    },
  },
];
