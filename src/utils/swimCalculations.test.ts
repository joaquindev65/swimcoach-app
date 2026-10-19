import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, parseTimeToSeconds, calculatePacesForDistance } from './swimCalculations.ts';
import { convertPoolTime } from './poolConversion.ts';

test('formatTime redondea las centésimas sin llegar a 100', () => {
  assert.equal(formatTime(26.996), '27.00s');
  assert.equal(formatTime(59.999), '1:00.00');
  assert.equal(formatTime(119.997), '2:00.00');
  assert.equal(formatTime(61.07), '1:01.07');
  assert.equal(formatTime(26.8), '26.80s');
  assert.equal(formatTime(0), '--:--.--');
});

test('parseTimeToSeconds acepta formatos válidos', () => {
  assert.equal(parseTimeToSeconds('1:01.07'), 61.07);
  assert.equal(parseTimeToSeconds('26,80'), 26.8);
  assert.equal(parseTimeToSeconds('61.07'), 61.07);
});

test('parseTimeToSeconds rechaza entradas inválidas', () => {
  for (const bad of ['1:90', '1:2:3', '0:0', '-1:30', '', 'abc', '0']) {
    assert.equal(parseTimeToSeconds(bad), null, bad);
  }
});

test('calculatePacesForDistance sigue la planilla', () => {
  const p = calculatePacesForDistance(61.07, 100, 'LIBRE', 20);
  assert.ok(Math.abs(p.objectiveTime - 61.07 * 0.97) < 1e-9);
  assert.ok(Math.abs(p.trainingBaseTime - 61.07 * 1.03) < 1e-9);
  const a2 = p.zones.find((z) => z.config.code === 'A2_80')!;
  assert.ok(Math.abs(a2.paceTime - 61.07 * 1.03 * 1.2) < 1e-9);
  assert.equal(a2.bpm, 160); // (220-20)*0.80
  assert.equal(a2.restSecs, 30);
});

test('convertPoolTime ida y vuelta SCM -> LCM -> SCM', () => {
  const lcm = convertPoolTime(61.07, 'SCM', 'LCM', 'LIBRE', 100);
  assert.equal(convertPoolTime(lcm, 'LCM', 'SCM', 'LIBRE', 100), 61.07);
});
