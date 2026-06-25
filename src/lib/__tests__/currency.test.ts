import { describe, it, expect } from 'vitest';
import { uid } from '../id';

describe('uid', () => {
  it('generates a 22-char base64url-ish string', () => {
    const id = uid();
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it('generates unique ids on repeated calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()));
    expect(ids.size).toBe(1000);
  });
});

import { formatMoney, parseAmountToCents, centsToMajor, majorToCents } from '../currency';

describe('currency', () => {
  it('formats cents to a currency string', () => {
    expect(formatMoney(1234, 'USD')).toBe('$12.34');
    expect(formatMoney(0, 'USD')).toBe('$0.00');
    expect(formatMoney(-500, 'EUR')).toBe('-€5.00');
  });

  it('converts cents to major units', () => {
    expect(centsToMajor(1234)).toBe(12.34);
    expect(centsToMajor(0)).toBe(0);
    expect(centsToMajor(-99)).toBe(-0.99);
  });

  it('converts major units to cents with rounding', () => {
    expect(majorToCents(12.34)).toBe(1234);
    expect(majorToCents(0.1 + 0.2)).toBe(30);
    expect(majorToCents(-5.0)).toBe(-500);
  });

  it('parses a user-typed amount string to cents', () => {
    expect(parseAmountToCents('12.34')).toBe(1234);
    expect(parseAmountToCents('12')).toBe(1200);
    expect(parseAmountToCents('12,34')).toBe(1234);
    expect(parseAmountToCents('')).toBe(0);
    expect(parseAmountToCents('abc')).toBe(0);
    expect(parseAmountToCents('-5.00')).toBe(-500);
  });
});
