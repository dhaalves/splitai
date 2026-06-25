import type { Frequency } from '../db/schema';

/**
 * Compute the next due date for a recurring expense, given the current
 * due date and frequency. Handles month-end rollbacks (Jan 31 -> Feb 28)
 * and leap-year Feb 29 -> Feb 28 on non-leap years.
 */
export function nextDueDate(currentMs: number, frequency: Frequency): number {
  const d = new Date(currentMs);
  if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7);
    return d.getTime();
  }
  if (frequency === 'yearly') {
    const day = d.getDate();
    const month = d.getMonth();
    const nextYear = d.getFullYear() + 1;
    if (month === 1 && day === 29) {
      const candidate = new Date(nextYear, 1, 29);
      if (candidate.getMonth() !== 1) {
        return new Date(nextYear, 1, 28).getTime();
      }
      return candidate.getTime();
    }
    return new Date(nextYear, month, day).getTime();
  }
  // monthly
  const day = d.getDate();
  const nextMonth = d.getMonth() + 1;
  const nextYear = d.getFullYear() + (nextMonth > 11 ? 1 : 0);
  const monthIndex = nextMonth % 12;
  const candidate = new Date(nextYear, monthIndex, day);
  if (candidate.getMonth() !== monthIndex) {
    const lastDay = new Date(nextYear, monthIndex + 1, 0).getDate();
    return new Date(nextYear, monthIndex, lastDay).getTime();
  }
  return candidate.getTime();
}
