import type { SplitAIDb } from './db';
import { CURRENT_SCHEMA_VERSION } from './db';

const SCHEMA_VERSION_KEY = 'schemaVersion';

export async function getSchemaVersion(db: SplitAIDb): Promise<number> {
  const row = await db.meta.get(SCHEMA_VERSION_KEY);
  const v = row?.value;
  return typeof v === 'number' ? v : 0;
}

export async function setSchemaVersion(db: SplitAIDb, version: number): Promise<void> {
  await db.meta.put({ key: SCHEMA_VERSION_KEY, value: version });
}

export type MigrationMap = Record<number, (db: SplitAIDb) => Promise<void>>;

/**
 * Run forward-only migrations from the stored schema version up to
 * the target version (max of CURRENT_SCHEMA_VERSION and the highest
 * migration key). Updates the stored version after each migration.
 */
export async function runMigrations(db: SplitAIDb, migrations: MigrationMap): Promise<void> {
  let current = await getSchemaVersion(db);
  const target = Math.max(CURRENT_SCHEMA_VERSION, ...Object.keys(migrations).map(Number));
  for (let v = current + 1; v <= target; v += 1) {
    const migrate = migrations[v];
    if (migrate) await migrate(db);
    await setSchemaVersion(db, v);
    current = v;
  }
}
