import { getDb } from './db';
import { runMigrations } from './migrations';
import { seedCategories, hasSeeded, markSeeded } from './seed';
import { runRecurringSweep } from './recurringSweep';
import { runPurgeSweep } from './purgeSweep';

let _initPromise: Promise<void> | null = null;

/**
 * Run the full app initialization sequence. Idempotent — safe to call
 * multiple times; the work only happens once.
 */
export function initApp(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const db = getDb();
    await runMigrations(db, {
      1: async () => {},
    });
    if (!(await hasSeeded(db))) {
      await seedCategories(db);
      await markSeeded(db);
    } else {
      await seedCategories(db);
    }
    await runRecurringSweep(db);
    await runPurgeSweep(db);
  })();
  return _initPromise;
}

/** For tests: reset the init singleton. */
export function resetInit() {
  _initPromise = null;
}
