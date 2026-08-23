import { describe, it, expect } from 'vitest';
import { createTaskInput } from './schema';

describe('createTaskInput', () => {
  it('rechaza título vacío', () => {
    expect(() => createTaskInput.parse({ title: '' })).toThrow();
  });

  it('aplica defaults (status/priority/source)', () => {
    const r = createTaskInput.parse({ title: 'Comprar pan' });
    expect(r.status).toBe('todo');
    expect(r.priority).toBe(3);
    expect(r.source).toBe('app');
  });

  it('rechaza priority fuera de 1..4', () => {
    expect(() => createTaskInput.parse({ title: 'X', priority: 9 })).toThrow();
  });

  it('rechaza dueAt no-ISO', () => {
    expect(() => createTaskInput.parse({ title: 'X', dueAt: 'mañana' })).toThrow();
  });
});
