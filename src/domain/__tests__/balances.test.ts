import { describe, it, expect } from 'vitest';
import { computeNetBalances, pairBalance, groupBalances } from '../balances';
import type { Expense } from '../../db/schema';

const U = { you: 'u-you', ada: 'u-ada', bob: 'u-bob' };

function expense(partial: Partial<Expense> & { paidBy: string; splits: { userId: string; share: number }[]; amount: number }): Expense {
  return {
    id: 'e-' + Math.random().toString(36).slice(2),
    amount: partial.amount,
    currency: 'USD',
    description: partial.description ?? 'x',
    category: partial.category ?? 'general',
    date: partial.date ?? Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    groupId: partial.groupId ?? null,
    paidBy: partial.paidBy,
    splitMethod: partial.splitMethod ?? 'equal',
    splits: partial.splits,
    isSettlement: partial.isSettlement ?? false,
    recurringId: partial.recurringId ?? null,
    deletedAt: partial.deletedAt ?? null,
  };
}

describe('computeNetBalances', () => {
  it('returns empty map for no expenses', () => {
    expect(computeNetBalances([])).toEqual({});
  });

  it('paid-by gets credited amount, others debited their owed share', () => {
    const e = expense({
      amount: 1200,
      paidBy: U.ada,
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
    });
    const net = computeNetBalances([e]);
    expect(net[U.ada]).toBe(600);
    expect(net[U.you]).toBe(-600);
  });

  it('excludes soft-deleted expenses', () => {
    const e = expense({
      amount: 1200,
      paidBy: U.ada,
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
      deletedAt: Date.now(),
    });
    expect(computeNetBalances([e])).toEqual({});
  });

  it('includes settlements (they reduce balances)', () => {
    const e = expense({
      amount: 600,
      paidBy: U.you,
      splitMethod: 'exact',
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 600 }],
      isSettlement: true,
    });
    const net = computeNetBalances([e]);
    expect(net[U.you]).toBe(600);
    expect(net[U.ada]).toBe(-600);
  });
});

describe('pairBalance', () => {
  it('returns "a owes b" when a has negative net and b positive', () => {
    const e = expense({
      amount: 1200,
      paidBy: U.ada,
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
    });
    const bal = pairBalance([e], U.you, U.ada);
    expect(bal).toEqual({ from: U.you, to: U.ada, amount: 600 });
  });

  it('returns amount 0 when settled up', () => {
    const e1 = expense({
      amount: 1200,
      paidBy: U.ada,
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
    });
    const e2 = expense({
      amount: 600,
      paidBy: U.you,
      splitMethod: 'exact',
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 600 }],
      isSettlement: true,
    });
    const bal = pairBalance([e1, e2], U.you, U.ada);
    expect(bal.amount).toBe(0);
  });

  it('scopes to a group when groupId provided', () => {
    const inGroup = expense({
      amount: 1000,
      paidBy: U.ada,
      groupId: 'g1',
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
    });
    const outGroup = expense({
      amount: 500,
      paidBy: U.you,
      groupId: 'g2',
      splits: [{ userId: U.you, share: 0 }, { userId: U.ada, share: 0 }],
    });
    const bal = pairBalance([inGroup, outGroup], U.you, U.ada, 'g1');
    expect(bal.amount).toBe(500);
  });
});

describe('groupBalances', () => {
  it('returns per-member net for group expenses', () => {
    const e = expense({
      amount: 900,
      paidBy: U.ada,
      groupId: 'g1',
      splits: [
        { userId: U.you, share: 0 },
        { userId: U.ada, share: 0 },
        { userId: U.bob, share: 0 },
      ],
    });
    const net = groupBalances([e], 'g1');
    expect(net[U.ada]).toBe(600);
    expect(net[U.you]).toBe(-300);
    expect(net[U.bob]).toBe(-300);
  });
});
