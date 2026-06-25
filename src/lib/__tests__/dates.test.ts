import { describe, it, expect } from 'vitest';
import { formatDate, startOfMonth, endOfMonth, monthKey, isSameMonth } from '../dates';

describe('dates', () => {
  it('formats a timestamp as a readable date', () => {
    expect(formatDate(new Date(2026, 5, 25).getTime())).toBe('Jun 25, 2026');
    expect(formatDate(new Date(2026, 0, 1).getTime())).toBe('Jan 1, 2026');
  });

  it('returns start of month (00:00 local) for a given timestamp', () => {
    const mid = new Date(2026, 5, 15, 12, 30).getTime();
    const start = startOfMonth(mid);
    expect(new Date(start).getDate()).toBe(1);
    expect(new Date(start).getHours()).toBe(0);
    expect(new Date(start).getMonth()).toBe(5);
  });

  it('returns end of month (23:59:59.999 local) for a given timestamp', () => {
    const mid = new Date(2026, 5, 15).getTime();
    const end = endOfMonth(mid);
    const d = new Date(end);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(30);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });

  it('produces a YYYY-MM month key', () => {
    expect(monthKey(new Date(2026, 5, 15).getTime())).toBe('2026-06');
    expect(monthKey(new Date(2026, 0, 1).getTime())).toBe('2026-01');
  });

  it('checks whether two timestamps fall in the same calendar month', () => {
    const a = new Date(2026, 5, 1).getTime();
    const b = new Date(2026, 5, 30).getTime();
    const c = new Date(2026, 6, 1).getTime();
    expect(isSameMonth(a, b)).toBe(true);
    expect(isSameMonth(a, c)).toBe(false);
  });
});
