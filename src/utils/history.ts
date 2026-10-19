import type { StrokeType, TimeEntry } from '../types/swim';

/** Agrega una marca al historial; si ya hay una de la misma prueba y día, la reemplaza. */
export function addHistory(history: TimeEntry[] | undefined, entry: TimeEntry): TimeEntry[] {
  const rest = (history ?? []).filter(
    (h) => !(h.stroke === entry.stroke && h.distance === entry.distance && h.date === entry.date)
  );
  return [...rest, entry];
}

/** Últimas `limit` marcas de una prueba, la más reciente primero. */
export function historyFor(
  history: TimeEntry[] | undefined,
  stroke: StrokeType,
  distance: number,
  limit = 5
): TimeEntry[] {
  return (history ?? [])
    .filter((h) => h.stroke === stroke && h.distance === distance)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
