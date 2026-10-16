import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui's expected location/name for this helper. Same implementation as
// the existing src/utils/cn.ts (kept there too — many existing components
// already import from it; this one exists so shadcn-generated components,
// which import from '@/lib/utils' by convention, work unmodified.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
