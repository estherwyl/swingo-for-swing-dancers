import { afterEach, describe, expect, it, vi } from 'vitest';
import { daysSince, fmt, sortKey, todayStr } from '../dates.js';

describe('date helpers', () => {
  afterEach(() => vi.useRealTimers());

  it('formats dates in short, medium, and weekday forms', () => {
    expect(fmt('2026-08-19')).toEqual({
      md: 'Aug 19',
      medium: 'Aug 19, 2026',
      full: 'Wed Aug 19, 2026',
    });
  });

  it('uses the fixed fallback for a missing date and preserves malformed fields', () => {
    expect(fmt().medium).toBe('Jan 1, 2026');
    expect(fmt('2026').md).toBe('Jan undefined');
    expect(fmt('2026-03').medium).toBe('Mar undefined, 2026');
  });

  it('creates sortable keys with a midnight fallback', () => {
    expect(sortKey({ date: '2026-08-19', time: '09:05' })).toBe('2026-08-19T09:05');
    expect(sortKey({ date: '2026-08-19' })).toBe('2026-08-19T00:00');
  });

  it('calculates elapsed whole days without going below zero', () => {
    vi.setSystemTime(new Date(2026, 7, 19, 12));
    expect(daysSince('2026-08-17')).toBe(2);
    expect(daysSince('2026-08-20')).toBe(0);
  });

  it('zero-pads today', () => {
    vi.setSystemTime(new Date(2026, 0, 2, 9));
    expect(todayStr()).toBe('2026-01-02');
  });
});
