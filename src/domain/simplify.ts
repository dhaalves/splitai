export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

/**
 * Given net balances per user (positive = creditor, negative = debtor),
 * produce a minimal list of transfers that settles all debts.
 * Greedy: match the largest debtor to the largest creditor repeatedly.
 */
export function simplifyDebts(net: Record<string, number>): Transfer[] {
  const debtors = Object.entries(net)
    .filter(([, n]) => n < -0)
    .map(([id, n]) => ({ id, amt: -n }))
    .sort((a, b) => b.amt - a.amt);
  const creditors = Object.entries(net)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ id, amt: n }))
    .sort((a, b) => b.amt - a.amt);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const pay = Math.min(d.amt, c.amt);
    if (pay > 0) {
      transfers.push({ from: d.id, to: c.id, amount: pay });
    }
    d.amt -= pay;
    c.amt -= pay;
    if (d.amt <= 0) i += 1;
    if (c.amt <= 0) j += 1;
  }
  return transfers;
}
