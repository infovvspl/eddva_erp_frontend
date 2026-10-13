// Shared formatting helpers for the dashboard's premium widgets.

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function rupees(value: unknown): string {
  return `₹${toNumber(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Compact variant for axis labels / tight spaces — e.g. ₹12.4K, ₹3.2Cr.
export function compactRupees(value: unknown): string {
  const n = toNumber(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(abs >= 10_00_00_000 ? 0 : 1)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(abs >= 10_00_000 ? 0 : 1)}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${sign}₹${abs}`;
}

// SNAKE_CASE / snake_case → "Snake case".
export function humanize(value: string): string {
  const words = value.replace(/[_-]+/g, ' ').trim().toLowerCase().split(/\s+/);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
