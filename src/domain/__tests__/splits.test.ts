import { describe, it, expect } from 'vitest';
import { computeOwed } from '../splits';

const U = { a: 'u-a', b: 'u-b', c: 'u-c' };

describe('computeOwed', () => {
  it('equal: splits evenly with remainder to first entries', () => {
    const owed = computeOwed({
      amount: 1000,
      method: 'equal',
      splits: [{ userId: U.a, share: 0 }, { userId: U.b, share: 0 }, { userId: U.c, share: 0 }],
    });
    expect(owed).toEqual({ [U.a]: 334, [U.b]: 333, [U.c]: 333 });
  });

  it('equal: divides evenly when no remainder', () => {
    const owed = computeOwed({
      amount: 1200,
      method: 'equal',
      splits: [{ userId: U.a, share: 0 }, { userId: U.b, share: 0 }, { userId: U.c, share: 0 }],
    });
    expect(owed).toEqual({ [U.a]: 400, [U.b]: 400, [U.c]: 400 });
  });

  it('equal: single participant owes the full amount', () => {
    const owed = computeOwed({
      amount: 500,
      method: 'equal',
      splits: [{ userId: U.a, share: 0 }],
    });
    expect(owed).toEqual({ [U.a]: 500 });
  });

  it('exact: each owes their stated share', () => {
    const owed = computeOwed({
      amount: 1500,
      method: 'exact',
      splits: [{ userId: U.a, share: 500 }, { userId: U.b, share: 700 }, { userId: U.c, share: 300 }],
    });
    expect(owed).toEqual({ [U.a]: 500, [U.b]: 700, [U.c]: 300 });
  });

  it('percent: apportions by percentage with remainder distribution', () => {
    const owed = computeOwed({
      amount: 1000,
      method: 'percent',
      splits: [{ userId: U.a, share: 33 }, { userId: U.b, share: 33 }, { userId: U.c, share: 34 }],
    });
    expect(owed).toEqual({ [U.a]: 330, [U.b]: 330, [U.c]: 340 });
  });

  it('shares: apportions by relative weight with remainder', () => {
    const owed = computeOwed({
      amount: 1000,
      method: 'shares',
      splits: [{ userId: U.a, share: 1 }, { userId: U.b, share: 1 }, { userId: U.c, share: 2 }],
    });
    expect(owed).toEqual({ [U.a]: 250, [U.b]: 250, [U.c]: 500 });
  });

  it('shares: handles non-divisible weights with remainder to first', () => {
    const owed = computeOwed({
      amount: 1000,
      method: 'shares',
      splits: [{ userId: U.a, share: 1 }, { userId: U.b, share: 1 }, { userId: U.c, share: 1 }],
    });
    expect(owed).toEqual({ [U.a]: 334, [U.b]: 333, [U.c]: 333 });
  });

  it('returns empty map for empty splits', () => {
    const owed = computeOwed({ amount: 1000, method: 'equal', splits: [] });
    expect(owed).toEqual({});
  });
});
