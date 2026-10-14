export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Internal/noise fields a user never needs to see.
export const HIDDEN_KEY = /(^id$|_id$|^institute|created_at|updated_at|deleted_at)/;

// A raw actor id (requested_by, approved_by, ...) is redundant once the
// backend has resolved it to a display name under `${key}_name`.
export function hasResolvedName(key: string, flat: Record<string, unknown>): boolean {
  return `${key}_name` in flat;
}

// Labels the resolved-name sibling of a hidden id/actor field using the
// hidden field's own name, e.g. requested_by_name -> "Requested By" instead
// of "Requested By Name" (only when that sibling field is actually present —
// a plain "student_name" field keeps its own label).
export function displayLabel(key: string, flat: Record<string, unknown>): string {
  const base = key.replace(/_name$/, '');
  return humanizeKey(base !== key && base in flat ? base : key);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;
const MIDNIGHT_UTC = /T00:00(:00(\.0+)?)?(Z|\+00:00)?$/;

// Date-only values (and midnight timestamps, which are really dates) show as a
// date; anything with a time of day shows date and time.
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const dateOnly = !value.includes('T') || MIDNIGHT_UTC.test(value);
  return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
}

export function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    return /percent|pct/i.test(key) ? `${value}%` : String(value);
  }
  if (typeof value === 'string' && ISO_DATE.test(value)) return formatDateTime(value);
  return String(value);
}

export function isPrimitive(value: unknown): value is string | number | boolean | null {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Lifts primitives out of one level of nested objects (e.g. student.name ->
// student_name) so generic tables and tiles can show them.
export function flattenRecord(record: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, value]) => {
    if (isPlainObject(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        if (!isPrimitive(childValue)) return;
        // Avoid "block_block_id": don't repeat the parent key when the child
        // key already starts with it (e.g. parent "block" + child "block_id").
        const alreadyPrefixed =
          childKey.toLowerCase() === key.toLowerCase() ||
          childKey.toLowerCase().startsWith(`${key.toLowerCase()}_`);
        flat[alreadyPrefixed ? childKey : `${key}_${childKey}`] = childValue;
      });
    } else {
      flat[key] = value;
    }
  });
  return flat;
}

// Current local time as an <input type="datetime-local"> value.
export function nowDateTimeInput(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Amounts are assumed to be rupees. Accepts numeric strings (Decimal columns).
export function formatCurrency(amount: unknown): string {
  const value = Number(amount);
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
}
