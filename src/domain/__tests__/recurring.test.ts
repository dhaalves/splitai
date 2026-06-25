import { describe, it, expect } from 'vitest';
import { nextDueDate } from '../recurring';

describe('nextDueDate', () => {
  it('weekly: adds 7 days', () => {
    const start = new Date(2026, 5, 25).getTime();
    const next = nextDueDate(start, 'weekly');
    expect(new Date(next)).toEqual(new Date(2026, 6, 2));
  });

  it('monthly: advances same day next month', () => {
    const start = new Date(2026, 0, 15).getTime();
    const next = nextDueDate(start, 'monthly');
    expect(new Date(next)).toEqual(new Date(2026, 1, 15));
  });

  it('monthly: rolls back to month end if next month has no such day', () => {
    const start = new Date(2026, 0, 31).getTime();
    const next = nextDueDate(start, 'monthly');
    expect(new Date(next)).toEqual(new Date(2026, 1, 28));
  });

  it('monthly: from Feb 28 rolls to Mar 28', () => {
    const start = new Date(2026, 1, 28).getTime();
    const next = nextDueDate(start, 'monthly');
    expect(new Date(next)).toEqual(new Date(2026, 2, 28));
  });

  it('yearly: advances one year on Feb 29 rolling back to Feb 28 on non-leap', () => {
    const start = new Date(2024, 1, 29).getTime();
    const next = nextDueDate(start, 'yearly');
    expect(new Date(next)).toEqual(new Date(2025, 1, 28));
  });

  it('yearly: otherwise advances one year same date', () => {
    const start = new Date(2026, 5, 15).getTime();
    const next = nextDueDate(start, 'yearly');
    expect(new Date(next)).toEqual(new Date(2027, 5, 15));
  });
});
