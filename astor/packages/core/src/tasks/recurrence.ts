import { RRule } from 'rrule';
import { DateTime } from 'luxon';

/**
 * Próxima ocurrencia (estrictamente después de `after`) de una regla RRULE,
 * anclada al "wall clock" de la zona de `after`. Pura y testeable.
 *
 * Se opera en tiempo de pared: se construye el dtstart como UTC-naive con los
 * componentes locales de `after`, se pide la siguiente ocurrencia a rrule, y se
 * reconstruye el DateTime en la zona original. Evita corrimientos por DST/offset.
 *
 * @param rule  cuerpo RRULE, p.ej. "FREQ=WEEKLY;BYDAY=MO,TH" o "RRULE:FREQ=DAILY".
 * @param after referencia (normalmente el due_at actual, en la zona del usuario).
 * @returns el próximo DateTime, o null si la regla no tiene más ocurrencias.
 */
export function nextOccurrence(rule: string, after: DateTime): DateTime | null {
  const zone = after.zoneName ?? 'utc';
  const dtstart = new Date(
    Date.UTC(after.year, after.month - 1, after.day, after.hour, after.minute, 0),
  );

  const options = RRule.parseString(rule.replace(/^RRULE:/i, ''));
  options.dtstart = dtstart;
  const rrule = new RRule(options);

  const next = rrule.after(dtstart, false); // false = estrictamente después
  if (!next) return null;

  return DateTime.fromObject(
    {
      year: next.getUTCFullYear(),
      month: next.getUTCMonth() + 1,
      day: next.getUTCDate(),
      hour: next.getUTCHours(),
      minute: next.getUTCMinutes(),
    },
    { zone },
  );
}
