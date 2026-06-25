import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '../../db/db';

export function useProfile() {
  return useLiveQuery(async () => {
    const all = await getDb().profiles.toArray();
    return all[0];
  }, []);
}
