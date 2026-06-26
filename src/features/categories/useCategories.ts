import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Category } from '../../db/schema';
import { uid } from '../../lib/id';

export function useCategories() {
  return useLiveQuery(() => getDb().categories.toArray(), []);
}

export async function createCategory(input: { name: string; icon: string; color: string }): Promise<Category> {
  const c: Category = {
    id: uid(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    system: false,
  };
  await getDb().categories.add(c);
  return c;
}

export async function deleteCategory(id: string): Promise<void> {
  const c = await getDb().categories.get(id);
  if (c?.system) throw new Error('Cannot delete a system category');
  const db = getDb();
  const expenses = (await db.expenses.toArray()).filter((e) => e.category === id);
  if (expenses.length > 0) {
    await db.expenses.bulkPut(expenses.map((e) => ({ ...e, category: 'general' })));
  }
  await db.categories.delete(id);
}
