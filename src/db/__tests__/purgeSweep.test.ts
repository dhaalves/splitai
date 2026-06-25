import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '../db';
import { runPurgeSweep } from '../purgeSweep';
import type { Expense, Group } from '../schema';
import { uid } from '../../lib/id';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

async function makeExpense(deletedAt: number | null): Promise<Expense> {
  const e: Expense = {
    id: uid(),
    amount: 1000,
    currency: 'USD',
    description: 'x',
    category: 'general',
    date: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    groupId: null,
    paidBy: 'u-x',
    splitMethod: 'equal',
    splits: [{ userId: 'u-x', share: 0 }],
    isSettlement: false,
    recurringId: null,
    deletedAt,
  };
  await getDb().expenses.add(e);
  return e;
}

async function makeGroup(deletedAt: number | null): Promise<Group> {
  const g: Group = {
    id: uid(),
    name: 'g',
    type: 'home',
    memberIds: ['u-x'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt,
  };
  await getDb().groups.add(g);
  return g;
}

describe('runPurgeSweep', () => {
  beforeEach(() => resetDb());

  it('deletes expenses soft-deleted more than 30 days ago', async () => {
    const now = Date.now();
    const old = await makeExpense(now - THIRTY_DAYS - 1);
    const recent = await makeExpense(now - 1000);
    const live = await makeExpense(null);
    const purged = await runPurgeSweep(getDb(), now);
    expect(purged).toBe(1);
    expect(await getDb().expenses.get(old.id)).toBeUndefined();
    expect(await getDb().expenses.get(recent.id)).toBeDefined();
    expect(await getDb().expenses.get(live.id)).toBeDefined();
  });

  it('deletes groups soft-deleted more than 30 days ago', async () => {
    const now = Date.now();
    const old = await makeGroup(now - THIRTY_DAYS - 1);
    const live = await makeGroup(null);
    const purged = await runPurgeSweep(getDb(), now);
    expect(purged).toBe(1);
    expect(await getDb().groups.get(old.id)).toBeUndefined();
    expect(await getDb().groups.get(live.id)).toBeDefined();
  });

  it('returns 0 when nothing is old enough', async () => {
    const now = Date.now();
    await makeExpense(now - 100);
    await makeGroup(now - 100);
    expect(await runPurgeSweep(getDb(), now)).toBe(0);
  });
});
