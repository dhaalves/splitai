import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '../db';
import { getSchemaVersion, setSchemaVersion, runMigrations } from '../migrations';

describe('migrations', () => {
  beforeEach(() => resetDb());

  it('getSchemaVersion returns 0 when never set', async () => {
    expect(await getSchemaVersion(getDb())).toBe(0);
  });

  it('setSchemaVersion persists and reads back', async () => {
    await setSchemaVersion(getDb(), 3);
    expect(await getSchemaVersion(getDb())).toBe(3);
  });

  it('runMigrations sets schema version to current and runs forward migrations', async () => {
    const applied: number[] = [];
    await runMigrations(getDb(), {
      1: async () => { applied.push(1); },
      2: async () => { applied.push(2); },
      3: async () => { applied.push(3); },
    });
    expect(applied).toEqual([1, 2, 3]);
    expect(await getSchemaVersion(getDb())).toBe(3);
  });

  it('runMigrations only applies migrations newer than stored version', async () => {
    await setSchemaVersion(getDb(), 2);
    const applied: number[] = [];
    await runMigrations(getDb(), {
      1: async () => { applied.push(1); },
      2: async () => { applied.push(2); },
      3: async () => { applied.push(3); },
    });
    expect(applied).toEqual([3]);
    expect(await getSchemaVersion(getDb())).toBe(3);
  });
});
