import Dexie, { Table } from 'dexie';
import type {
  Profile, Contact, Group, Expense, Recurring, Category, Meta,
} from './schema';

const SCHEMA_VERSION = 1;
const DEFAULT_DB_NAME = 'splitai-db';

export class SplitAIDb extends Dexie {
  profiles!: Table<Profile, string>;
  contacts!: Table<Contact, string>;
  groups!: Table<Group, string>;
  expenses!: Table<Expense, string>;
  recurring!: Table<Recurring, string>;
  categories!: Table<Category, string>;
  meta!: Table<Meta, string>;

  constructor(name: string = DEFAULT_DB_NAME) {
    super(name);
    this.version(SCHEMA_VERSION).stores({
      profiles: 'id',
      contacts: 'id',
      groups: 'id, deletedAt',
      expenses: 'id, groupId, paidBy, date, deletedAt, recurringId',
      recurring: 'id, active, nextDate',
      categories: 'id, system',
      meta: 'key',
    });
  }
}

let _db: SplitAIDb | null = null;
export function getDb(): SplitAIDb {
  if (!_db) _db = new SplitAIDb();
  return _db;
}

/** For tests: close the singleton and create a fresh in-memory db with a unique name. */
export function resetDb(name?: string): SplitAIDb {
  if (_db) _db.close();
  _db = new SplitAIDb(name ?? 'splitai-test-' + Math.random().toString(36).slice(2));
  return _db;
}

export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION;
