import type { SplitEntry, SplitMethod } from '../db/schema';

export interface ComputeOwedInput {
  amount: number;
  method: SplitMethod;
  splits: SplitEntry[];
}

/**
 * Compute the owed amount (in cents) per user for an expense.
 * Remainder cents are distributed to the earliest splits in order.
 */
export function computeOwed(input: ComputeOwedInput): Record<string, number> {
  const { amount, method, splits } = input;
  if (splits.length === 0) return {};

  if (method === 'exact') {
    const out: Record<string, number> = {};
    for (const s of splits) out[s.userId] = s.share;
    return out;
  }

  const weights =
    method === 'equal'
      ? splits.map(() => 1)
      : splits.map((s) => s.share);

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) {
    const out: Record<string, number> = {};
    for (const s of splits) out[s.userId] = 0;
    return out;
  }

  const raw = weights.map((w) => (amount * w) / totalWeight);
  const floored = raw.map((r) => Math.floor(r));
  const remainder = amount - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  let left = remainder;
  while (left > 0 && k < order.length) {
    floored[order[k].i] += 1;
    left -= 1;
    k += 1;
  }

  const out: Record<string, number> = {};
  splits.forEach((s, i) => (out[s.userId] = floored[i]));
  return out;
}
