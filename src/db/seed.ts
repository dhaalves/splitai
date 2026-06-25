import type { Category, Profile } from './schema';
import type { SplitAIDb } from './db';
import { uid } from '../lib/id';

export const defaultCategories: Category[] = [
  { id: 'general', name: 'General', icon: '🧾', color: '#64748b', system: true },
  { id: 'food', name: 'Food & Drink', icon: '🍽️', color: '#f59e0b', system: true },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#10b981', system: true },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#6366f1', system: true },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#0ea5e9', system: true },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#ec4899', system: true },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#8b5cf6', system: true },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#ef4444', system: true },
  { id: 'other', name: 'Other', icon: '📦', color: '#94a3b8', system: true },
];

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export async function seedCategories(db: SplitAIDb): Promise<void> {
  const existing = await db.categories.toArray();
  const have = new Set(existing.map((c) => c.id));
  const toAdd = defaultCategories.filter((c) => !have.has(c.id));
  if (toAdd.length > 0) await db.categories.bulkAdd(toAdd);
}

const SEEDED_KEY = 'seeded';

export async function hasSeeded(db: SplitAIDb): Promise<boolean> {
  const row = await db.meta.get(SEEDED_KEY);
  return Boolean(row?.value);
}

export async function markSeeded(db: SplitAIDb): Promise<void> {
  await db.meta.put({ key: SEEDED_KEY, value: true });
}

export async function createProfile(
  db: SplitAIDb,
  input: { firstName: string; lastName: string; email: string; defaultCurrency: string }
): Promise<Profile> {
  const profile: Profile = {
    id: uid(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    defaultCurrency: input.defaultCurrency,
    avatarColor: randomAvatarColor(),
    createdAt: Date.now(),
  };
  await db.profiles.add(profile);
  return profile;
}
