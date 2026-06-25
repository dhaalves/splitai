import { describe, it, expect } from 'vitest';
import { simplifyDebts } from '../simplify';

const U = { a: 'u-a', b: 'u-b', c: 'u-c', d: 'u-d' };

describe('simplifyDebts', () => {
  it('returns empty for zero or empty balances', () => {
    expect(simplifyDebts({})).toEqual([]);
    expect(simplifyDebts({ [U.a]: 0, [U.b]: 0 })).toEqual([]);
  });

  it('matches a single debtor to a single creditor', () => {
    const transfers = simplifyDebts({ [U.a]: -500, [U.b]: 500 });
    expect(transfers).toEqual([{ from: U.a, to: U.b, amount: 500 }]);
  });

  it('matches largest debtor to largest creditor greedily', () => {
    const transfers = simplifyDebts({
      [U.a]: -300,
      [U.b]: -200,
      [U.c]: 200,
      [U.d]: 300,
    });
    expect(transfers).toContainEqual({ from: U.a, to: U.d, amount: 300 });
    expect(transfers).toContainEqual({ from: U.b, to: U.c, amount: 200 });
    expect(transfers).toHaveLength(2);
    const totalSent = transfers.reduce((s, t) => s + t.amount, 0);
    expect(totalSent).toBe(500);
  });

  it('splits a creditor across multiple debtors', () => {
    const transfers = simplifyDebts({
      [U.a]: -100,
      [U.b]: -400,
      [U.c]: 500,
    });
    expect(transfers).toContainEqual({ from: U.b, to: U.c, amount: 400 });
    expect(transfers).toContainEqual({ from: U.a, to: U.c, amount: 100 });
    expect(transfers).toHaveLength(2);
  });

  it('preserves the sum of all transfers equal to total debt', () => {
    const nets = { [U.a]: -123, [U.b]: -456, [U.c]: 789, [U.d]: -210 };
    const transfers = simplifyDebts(nets);
    const totalSent = transfers.reduce((s, t) => s + t.amount, 0);
    const totalDebt = Object.values(nets).filter((n) => n < 0).reduce((s, n) => s + -n, 0);
    expect(totalSent).toBe(totalDebt);
  });
});
