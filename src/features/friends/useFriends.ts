import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Contact } from '../../db/schema';
import { uid } from '../../lib/id';
import { randomAvatarColor } from '../../db/seed';

export function useFriends() {
  return useLiveQuery(async () => {
    // `contacts` store does not index createdAt; sort in JS (small per-user list).
    const all = await getDb().contacts.toArray();
    return all.sort((a, b) => a.createdAt - b.createdAt) as Contact[];
  }, []);
}

export function useFriend(id: string | undefined) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    return (await getDb().contacts.get(id)) as Contact | undefined;
  }, [id]);
}

export async function createFriend(input: {
  firstName: string;
  lastName: string;
  email?: string;
}): Promise<Contact> {
  const c: Contact = {
    id: uid(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email?.trim() || undefined,
    avatarColor: randomAvatarColor(),
    createdAt: Date.now(),
  };
  await getDb().contacts.add(c);
  return c;
}

export async function deleteFriend(id: string): Promise<void> {
  const db = getDb();
  const allExpenses = await db.expenses.toArray();
  const liveExpenses = allExpenses.filter((e) => e.deletedAt === null);
  const inExpenses = liveExpenses.some(
    (e) => e.paidBy === id || e.splits.some((s) => s.userId === id)
  );
  const inGroups = (await db.groups.toArray()).filter(
    (g) => g.deletedAt === null && g.memberIds.includes(id)
  );
  if (inExpenses || inGroups.length > 0) {
    throw new Error('Cannot delete a friend who is part of expenses or groups. Remove them first.');
  }
  await db.contacts.delete(id);
}
