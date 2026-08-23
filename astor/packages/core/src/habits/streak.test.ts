import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { computeStreak, buildHeatmap, type HabitLogLite } from './streak';

const today = DateTime.fromISO('2026-08-23', { zone: 'utc' });
const d = (offset: number): string => today.minus({ days: offset }).toISODate() ?? '';

describe('computeStreak', () => {
  it('cuenta días done consecutivos terminando hoy', () => {
    const logs: HabitLogLite[] = [
      { date: d(0), status: 'done' },
      { date: d(1), status: 'done' },
      { date: d(2), status: 'done' },
    ];
    expect(computeStreak(logs, today)).toEqual({ current: 3, longest: 3 });
  });

  it('grace: si hoy no está logueado, arranca ayer', () => {
    const logs: HabitLogLite[] = [
      { date: d(1), status: 'done' },
      { date: d(2), status: 'done' },
    ];
    expect(computeStreak(logs, today).current).toBe(2);
  });

  it("skipped no corta la racha pero no suma", () => {
    const logs: HabitLogLite[] = [
      { date: d(0), status: 'done' },
      { date: d(1), status: 'skipped' },
      { date: d(2), status: 'done' },
    ];
    expect(computeStreak(logs, today).current).toBe(2);
  });

  it('un día faltante corta la racha actual', () => {
    const logs: HabitLogLite[] = [
      { date: d(0), status: 'done' },
      { date: d(2), status: 'done' },
      { date: d(3), status: 'done' },
    ];
    expect(computeStreak(logs, today).current).toBe(1);
  });

  it('longest sobre toda la historia', () => {
    const logs: HabitLogLite[] = [
      { date: d(10), status: 'done' },
      { date: d(9), status: 'done' },
      { date: d(8), status: 'done' },
      { date: d(5), status: 'done' },
      { date: d(0), status: 'done' },
    ];
    expect(computeStreak(logs, today).longest).toBe(3);
  });
});

describe('buildHeatmap', () => {
  it('devuelve N días terminando hoy con su estado', () => {
    const logs: HabitLogLite[] = [
      { date: d(0), status: 'done' },
      { date: d(1), status: 'skipped' },
    ];
    const hm = buildHeatmap(logs, 3, today);
    expect(hm).toHaveLength(3);
    expect(hm[2]).toEqual({ date: d(0), status: 'done' });
    expect(hm[1]).toEqual({ date: d(1), status: 'skipped' });
    expect(hm[0]).toEqual({ date: d(2), status: null });
  });
});
