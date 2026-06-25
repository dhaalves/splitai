import { describe, it, expect } from 'vitest';
import { validateAndRemap, type BackupFile } from '../importValidate';

const baseFile: BackupFile = {
  schemaVersion: 1,
  profile: {
    id: 'p-1', firstName: 'You', lastName: 'Y', email: 'you@x.com',
    defaultCurrency: 'USD', avatarColor: '#000', createdAt: 1000,
  },
  contacts: [
    { id: 'c-1', firstName: 'Ada', lastName: 'L', avatarColor: '#fff', createdAt: 1000 },
  ],
  groups: [
    { id: 'g-1', name: 'Home', type: 'home', memberIds: ['p-1', 'c-1'], createdAt: 1000, updatedAt: 1000, deletedAt: null },
  ],
  expenses: [
    {
      id: 'e-1', amount: 1000, currency: 'USD', description: 'd', category: 'food',
      date: 1000, createdAt: 1000, updatedAt: 1000, groupId: 'g-1', paidBy: 'p-1',
      splitMethod: 'equal', splits: [{ userId: 'p-1', share: 0 }, { userId: 'c-1', share: 0 }],
      isSettlement: false, recurringId: null, deletedAt: null,
    },
  ],
  recurring: [],
  categories: [],
};

describe('validateAndRemap', () => {
  it('returns ok with remapped ids for a valid file', () => {
    const r = validateAndRemap(baseFile);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const { profile, contacts, groups, expenses } = r.data;
    expect(profile.id).not.toBe('p-1');
    expect(contacts[0].id).not.toBe('c-1');
    expect(groups[0].id).not.toBe('g-1');
    expect(expenses[0].id).not.toBe('e-1');
    expect(groups[0].memberIds).toContain(profile.id);
    expect(groups[0].memberIds).toContain(contacts[0].id);
    expect(expenses[0].groupId).toBe(groups[0].id);
    expect(expenses[0].paidBy).toBe(profile.id);
    expect(expenses[0].splits.map((s) => s.userId)).toContain(contacts[0].id);
  });

  it('rejects a file missing the profile', () => {
    const bad = { ...baseFile, profile: undefined } as unknown as BackupFile;
    const r = validateAndRemap(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/profile/i);
  });

  it('rejects a file with an expense referencing an unknown group id', () => {
    const bad: BackupFile = {
      ...baseFile,
      expenses: [{ ...baseFile.expenses[0], groupId: 'g-nonexistent' }],
    };
    const r = validateAndRemap(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/group/);
  });

  it('rejects a file with an expense paid by an unknown user', () => {
    const bad: BackupFile = {
      ...baseFile,
      expenses: [{ ...baseFile.expenses[0], paidBy: 'u-ghost' }],
    };
    const r = validateAndRemap(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/paidBy/);
  });
});
