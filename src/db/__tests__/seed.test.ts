import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '../db';
import { seedCategories, hasSeeded, markSeeded, defaultCategories } from '../seed';

describe('seed', () => {
  beforeEach(() => resetDb());

  it('defaultCategories includes general, food, rent, travel, utilities', () => {
    const ids = defaultCategories.map((c) => c.id);
    expect(ids).toContain('general');
    expect(ids).toContain('food');
    expect(ids).toContain('rent');
    expect(ids).toContain('travel');
    expect(ids).toContain('utilities');
  });

  it('seedCategories inserts the default categories into the db', async () => {
    await seedCategories(getDb());
    const all = await getDb().categories.toArray();
    expect(all.length).toBeGreaterThanOrEqual(5);
    expect(all.every((c) => c.system)).toBe(true);
  });

  it('seedCategories is idempotent (does not duplicate)', async () => {
    await seedCategories(getDb());
    await seedCategories(getDb());
    const all = await getDb().categories.toArray();
    const ids = all.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hasSeeded / markSeeded track first-run state in meta', async () => {
    expect(await hasSeeded(getDb())).toBe(false);
    await markSeeded(getDb());
    expect(await hasSeeded(getDb())).toBe(true);
  });
});
