import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addHistory, historyFor } from './history.ts';

const e = (date: string, time: number, distance = 100) => ({ stroke: 'LIBRE' as const, distance, time, date });

test('addHistory agrega y acepta historial indefinido', () => {
  assert.deepEqual(addHistory(undefined, e('2026-01-01', 61)), [e('2026-01-01', 61)]);
  assert.equal(addHistory([e('2026-01-01', 61)], e('2026-02-01', 60)).length, 2);
});

test('addHistory reemplaza la misma prueba el mismo día, no otras', () => {
  const h = addHistory([e('2026-01-01', 61), e('2026-01-01', 30, 50)], e('2026-01-01', 60));
  assert.equal(h.length, 2);
  assert.equal(h.find((x) => x.distance === 100)!.time, 60);
});

test('historyFor filtra por prueba, más reciente primero, con límite', () => {
  const h = [e('2026-01-01', 62), e('2026-03-01', 60), e('2026-02-01', 61), e('2026-02-01', 30, 50)];
  assert.deepEqual(historyFor(h, 'LIBRE', 100, 2).map((x) => x.time), [60, 61]);
});
