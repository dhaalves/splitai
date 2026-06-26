import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Group, GroupType } from '../../db/schema';
import { uid } from '../../lib/id';

export function useGroups() {
  return useLiveQuery(async () => {
    // `groups` store does not index createdAt; sort in JS (small per-user list).
    const all = await getDb().groups.toArray();
    return all
      .filter((g) => g.deletedAt === null)
      .sort((a, b) => a.createdAt - b.createdAt) as Group[];
  }, []);
}

export function useGroup(id: string | undefined) {
  return useLiveQuery(async () => (id ? getDb().groups.get(id) : undefined), [id]);
}

export async function createGroup(input: {
  name: string;
  type: GroupType;
  memberIds: string[];
}): Promise<Group> {
  const g: Group = {
    id: uid(),
    name: input.name.trim(),
    type: input.type,
    memberIds: input.memberIds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
  };
  await getDb().groups.add(g);
  return g;
}

export async function updateGroup(id: string, patch: Partial<Group>): Promise<void> {
  await getDb().groups.update(id, { ...patch, updatedAt: Date.now() });
}

export async function softDeleteGroup(id: string): Promise<void> {
  await getDb().groups.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
}

export async function addMember(groupId: string, contactId: string): Promise<void> {
  const g = await getDb().groups.get(groupId);
  if (!g) throw new Error('Group not found');
  if (g.memberIds.includes(contactId)) return;
  await updateGroup(groupId, { memberIds: [...g.memberIds, contactId] });
}

export async function removeMember(groupId: string, contactId: string): Promise<void> {
  const g = await getDb().groups.get(groupId);
  if (!g) throw new Error('Group not found');
  await updateGroup(groupId, { memberIds: g.memberIds.filter((id) => id !== contactId) });
}
