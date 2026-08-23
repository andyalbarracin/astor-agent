'use client';

import { DateTime } from 'luxon';

type Status = 'done' | 'skipped';

/** Heatmap estilo calendario (columnas = semanas, filas = Lun→Dom). */
export function Heatmap({
  logs,
  timezone,
  weeks = 17,
}: {
  logs: { date: string; status: Status }[];
  timezone: string;
  weeks?: number;
}) {
  const map = new Map(logs.map((l) => [l.date, l.status]));
  const today = DateTime.now().setZone(timezone).startOf('day');
  const gridStart = today.minus({ days: weeks * 7 - 1 }).startOf('week'); // lunes

  const columns: ({ date: string; status: Status | null } | null)[][] = [];
  let cursor = gridStart;
  while (cursor <= today) {
    const week: ({ date: string; status: Status | null } | null)[] = [];
    for (let r = 0; r < 7; r += 1) {
      const day = cursor.plus({ days: r });
      if (day > today) {
        week.push(null);
      } else {
        const key = day.toISODate() ?? '';
        week.push({ date: key, status: map.get(key) ?? null });
      }
    }
    columns.push(week);
    cursor = cursor.plus({ weeks: 1 });
  }

  function cellStyle(status: Status | null): string {
    if (status === 'done') return 'var(--color-signature-default)';
    if (status === 'skipped') return 'var(--color-border-default)';
    return 'var(--color-surface-sunken)';
  }

  return (
    <div className="flex gap-[3px] overflow-x-auto">
      {columns.map((week, ci) => (
        <div key={ci} className="flex flex-col gap-[3px]">
          {week.map((cell, ri) =>
            cell ? (
              <div
                key={ri}
                title={`${cell.date}${cell.status ? ` · ${cell.status === 'done' ? 'hecho' : 'salteado'}` : ''}`}
                className="size-[11px] rounded-[3px] ring-1 ring-inset ring-black/5"
                style={{ background: cellStyle(cell.status) }}
              />
            ) : (
              <div key={ri} className="size-[11px]" />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
