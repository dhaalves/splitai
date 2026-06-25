import { describe, it, expect } from 'vitest';
import { ok, err, unwrap, tryDb } from '../dbResult';

describe('dbResult', () => {
  it('ok wraps a value', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe(42);
  });

  it('err wraps a message', () => {
    const r = err('something failed');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('something failed');
  });

  it('unwrap returns data on ok', () => {
    expect(unwrap(ok(7))).toBe(7);
  });

  it('unwrap throws on err', () => {
    expect(() => unwrap(err('boom'))).toThrowError('boom');
  });

  it('tryDb wraps a resolved promise as ok', async () => {
    const r = await tryDb(Promise.resolve('value'));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data).toBe('value');
  });

  it('tryDb wraps a rejected promise as err', async () => {
    const r = await tryDb(Promise.reject(new Error('db down')));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('db down');
  });
});
