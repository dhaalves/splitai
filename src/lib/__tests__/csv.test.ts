import { describe, it, expect } from 'vitest';
import { toCsv } from '../csv';

describe('toCsv', () => {
  it('serializes rows with headers', () => {
    const csv = toCsv(
      ['id', 'name', 'amount'],
      [
        { id: '1', name: 'Ada', amount: 1234 },
        { id: '2', name: 'Bob', amount: -500 },
      ]
    );
    expect(csv).toBe('id,name,amount\n1,Ada,1234\n2,Bob,-500\n');
  });

  it('quotes fields containing commas, quotes, or newlines', () => {
    const csv = toCsv(
      ['id', 'note'],
      [
        { id: '1', note: 'hello, world' },
        { id: '2', note: 'say "hi"' },
        { id: '3', note: 'line\nbreak' },
      ]
    );
    expect(csv).toBe('id,note\n1,"hello, world"\n2,"say ""hi"""\n3,"line\nbreak"\n');
  });

  it('handles empty input', () => {
    expect(toCsv(['a', 'b'], [])).toBe('a,b\n');
  });
});
