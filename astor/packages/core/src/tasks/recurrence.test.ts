import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { nextOccurrence } from './recurrence';

const zone = 'America/Argentina/Buenos_Aires';

describe('nextOccurrence', () => {
  it('FREQ=DAILY → día siguiente', () => {
    const from = DateTime.fromISO('2026-08-23T09:00', { zone });
    expect(nextOccurrence('FREQ=DAILY', from)?.toISODate()).toBe('2026-08-24');
  });

  it('FREQ=WEEKLY;BYDAY=MO,TH desde un lunes → jueves', () => {
    const monday = DateTime.fromISO('2026-08-24T08:00', { zone }); // 2026-08-24 = lunes
    expect(nextOccurrence('FREQ=WEEKLY;BYDAY=MO,TH', monday)?.toISODate()).toBe('2026-08-27');
  });

  it('FREQ=MONTHLY → mismo día del mes siguiente', () => {
    const from = DateTime.fromISO('2026-08-24T10:00', { zone });
    expect(nextOccurrence('FREQ=MONTHLY', from)?.toISODate()).toBe('2026-09-24');
  });

  it('acepta el prefijo "RRULE:"', () => {
    const from = DateTime.fromISO('2026-08-23T09:00', { zone });
    expect(nextOccurrence('RRULE:FREQ=DAILY', from)?.toISODate()).toBe('2026-08-24');
  });

  it('preserva la hora de pared', () => {
    const from = DateTime.fromISO('2026-08-23T09:30', { zone });
    const next = nextOccurrence('FREQ=DAILY', from);
    expect(next?.hour).toBe(9);
    expect(next?.minute).toBe(30);
  });
});
