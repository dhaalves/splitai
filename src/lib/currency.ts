const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  let f = formatters.get(currency);
  if (!f) {
    f = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatters.set(currency, f);
  }
  return f;
}

export function formatMoney(cents: number, currency: string): string {
  return getFormatter(currency).format(cents / 100);
}

export function centsToMajor(cents: number): number {
  return Math.round(cents) / 100;
}

export function majorToCents(major: number): number {
  return Math.round(major * 100);
}

export function parseAmountToCents(input: string): number {
  if (!input) return 0;
  const normalized = input.trim().replace(',', '.');
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
