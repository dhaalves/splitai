function quoteField(value: string): string {
  if (/[",\n]/.test(value)) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const head = headers.join(',');
  const body = rows
    .map((r) => headers.map((h) => quoteField(String(r[h] ?? ''))).join(','))
    .join('\n');
  return head + '\n' + body + (body ? '\n' : '');
}
