import { DateTime } from 'luxon';

export interface HabitLogLite {
  date: string; // YYYY-MM-DD
  status: 'done' | 'skipped';
}

/**
 * Rachas de un hábito (funciones puras, sin DB).
 *
 * - `current`: días consecutivos que terminan hoy (o ayer, si hoy todavía no
 *   tiene log) donde 'done' suma, 'skipped' pasa sin sumar y un día faltante corta.
 * - `longest`: corrida máxima de días contiguos (done|skipped) contando los 'done'.
 */
export function computeStreak(
  logs: HabitLogLite[],
  today: DateTime,
): { current: number; longest: number } {
  const map = new Map<string, 'done' | 'skipped'>();
  for (const l of logs) map.set(l.date, l.status);

  // Racha actual: hacia atrás desde hoy (o ayer si hoy no está logueado).
  const todayKey = today.toISODate() ?? '';
  let cursor = map.has(todayKey) ? today : today.minus({ days: 1 });
  let current = 0;
  for (;;) {
    const key = cursor.toISODate() ?? '';
    const st = map.get(key);
    if (st === 'done') {
      current += 1;
      cursor = cursor.minus({ days: 1 });
    } else if (st === 'skipped') {
      cursor = cursor.minus({ days: 1 });
    } else {
      break;
    }
  }

  // Racha más larga: fechas ordenadas asc, reseteando en gaps de calendario.
  const dates = Array.from(map.keys())
    .map((d) => DateTime.fromISO(d, { zone: 'utc' }))
    .sort((a, b) => a.toMillis() - b.toMillis());
  let longest = 0;
  let run = 0;
  let prev: DateTime | null = null;
  for (const d of dates) {
    const key = d.toISODate() ?? '';
    const contiguous =
      prev !== null && Math.round(d.diff(prev, 'days').days) === 1;
    if (!contiguous) run = 0;
    if (map.get(key) === 'done') run += 1;
    if (run > longest) longest = run;
    prev = d;
  }

  return { current, longest };
}

/** Últimos `days` días (incluyendo hoy) con su estado, para el heatmap. */
export function buildHeatmap(
  logs: HabitLogLite[],
  days: number,
  today: DateTime,
): { date: string; status: 'done' | 'skipped' | null }[] {
  const map = new Map<string, 'done' | 'skipped'>();
  for (const l of logs) map.set(l.date, l.status);

  const out: { date: string; status: 'done' | 'skipped' | null }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = today.minus({ days: i }).toISODate() ?? '';
    out.push({ date: key, status: map.get(key) ?? null });
  }
  return out;
}
