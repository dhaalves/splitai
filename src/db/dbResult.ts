export type DbResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): DbResult<T> {
  return { ok: true, data };
}

export function err(error: string): DbResult<never> {
  return { ok: false, error };
}

export function unwrap<T>(r: DbResult<T>): T {
  if (r.ok) return r.data;
  throw new Error(r.error);
}

/** Wrap a Dexie promise in a DbResult. */
export async function tryDb<T>(p: Promise<T>): Promise<DbResult<T>> {
  try {
    const data = await p;
    return { ok: true, data };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { ok: false, error };
  }
}
