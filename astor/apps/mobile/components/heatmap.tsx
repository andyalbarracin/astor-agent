import { View } from 'react-native';
import { DateTime } from 'luxon';
import { useTheme } from '@astor/design-tokens/mobile';

type Status = 'done' | 'skipped';

/** Heatmap tipo calendario (columnas = semanas, filas = Lun→Dom). */
export function Heatmap({
  logs,
  timezone,
  weeks = 15,
}: {
  logs: { date: string; status: Status }[];
  timezone: string;
  weeks?: number;
}) {
  const t = useTheme();
  const map = new Map(logs.map((l) => [l.date, l.status]));
  const today = DateTime.now().setZone(timezone).startOf('day');
  const gridStart = today.minus({ days: weeks * 7 - 1 }).startOf('week');

  const columns: (Status | null | undefined)[][] = [];
  let cursor = gridStart;
  while (cursor <= today) {
    const week: (Status | null | undefined)[] = [];
    for (let r = 0; r < 7; r += 1) {
      const day = cursor.plus({ days: r });
      if (day > today) week.push(undefined);
      else week.push(map.get(day.toISODate() ?? '') ?? null);
    }
    columns.push(week);
    cursor = cursor.plus({ weeks: 1 });
  }

  const cellColor = (s: Status | null | undefined) => {
    if (s === undefined) return 'transparent';
    if (s === 'done') return t.color.signature.default;
    if (s === 'skipped') return t.color.border.default;
    return t.color.surface.sunken;
  };

  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {columns.map((week, ci) => (
        <View key={ci} style={{ gap: 3 }}>
          {week.map((cell, ri) => (
            <View
              key={ri}
              style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: cellColor(cell) }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
