import { afterEach, describe, expect, it, vi } from 'vitest';
import { aggregateEntries, freshCheckin, seedEntries } from '../entries.js';

describe('entry helpers', () => {
  afterEach(() => vi.useRealTimers());

  it('creates a blank check-in for today', () => {
    vi.setSystemTime(new Date(2026, 0, 4, 10));
    expect(freshCheckin()).toEqual({
      family: null,
      moveName: null,
      status: null,
      mood: [],
      note: '',
      referenceUrls: [''],
      date: '2026-01-04',
      cls: '',
      teacher: '',
      location: '',
    });
  });

  it('provides stable seeded entries', () => {
    const entries = seedEntries();
    expect(entries).toHaveLength(18);
    expect(entries[0]).toMatchObject({ id: 'seed-0', family: 'solo', moveName: 'Shorty George' });
    expect(entries.every((entry) => entry.id.startsWith('seed-'))).toBe(true);
  });

  it('aggregates logs by move and derives current and historical fields', () => {
    const entries = [
      { id: 'old', family: 'lindy', moveName: 'Swingout', date: '2026-01-01', time: '10:00', status: 'first_learned', mood: 'proud' },
      { id: 'new', family: 'lindy', moveName: 'Swingout', date: '2026-01-03', time: '09:00', status: 'used_in_social', mood: 'excited' },
      { id: 'tie', family: 'lindy', moveName: 'Swingout', date: '2026-01-02', time: '12:00', status: 'practiced', mood: 'excited' },
      { id: 'other', family: 'solo', moveName: 'Tangos', date: '2026-01-02', status: 'first_learned', mood: 'curious' },
    ];

    const result = aggregateEntries(entries);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      key: 'lindy|Swingout',
      firstDate: '2026-01-01',
      logs: 3,
      latestStatus: 'used_in_social',
      latestSk: '2026-01-03T09:00',
      mood: 'excited',
      hasSocial: true,
    });
    expect(result[0].list.map((entry) => entry.id)).toEqual(['new', 'tie', 'old']);
    expect(result[1]).toMatchObject({ key: 'solo|Tangos', hasSocial: false, mood: 'curious' });
  });

  it('returns no groups for empty input', () => {
    expect(aggregateEntries([])).toEqual([]);
  });
});
