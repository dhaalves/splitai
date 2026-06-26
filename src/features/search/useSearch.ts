import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';
import type { Expense } from '../../db/schema';

export interface SearchFilters {
  text: string;
  categoryIds: string[];
  groupId: string | null;
  fromMs: number | null;
  toMs: number | null;
}

export function useSearch(filters: SearchFilters): Expense[] | undefined {
  const all = useLiveQuery(() => getDb().expenses.orderBy('date').reverse().toArray(), []);
  return useMemo(() => {
    if (!all) return undefined;
    return all.filter((e) => {
      if (e.deletedAt !== null) return false;
      if (filters.text && !e.description.toLowerCase().includes(filters.text.toLowerCase())) return false;
      if (filters.categoryIds.length > 0 && !filters.categoryIds.includes(e.category)) return false;
      if (filters.groupId !== null && e.groupId !== filters.groupId) return false;
      if (filters.fromMs !== null && e.date < filters.fromMs) return false;
      if (filters.toMs !== null && e.date > filters.toMs) return false;
      return true;
    });
  }, [all, filters]);
}
