import { moduleSessions } from './moduleAuth';
import { getHostelToken } from '../features/hostel/utils/ssoSession';
import { getAlumniToken } from '../features/alumni/utils/ssoSession';
import { getSalesPurchaseToken } from '../features/sales-purchase/utils/ssoSession';
import { getCanteenToken } from '../features/canteen/utils/ssoSession';
import { getAdmissionToken } from '../features/admission/utils/ssoSession';

// Every module already exposes a `getToken(): Promise<string>`-shaped entry
// point (the 7 built on `createModuleSession` via `moduleSessions`, plus
// these 5 standalone ones) with its own cache/dedupe built in — calling it
// here just warms that cache early so a real page visit afterward is a hit.
const allModuleTokenGetters: Array<() => Promise<string>> = [
  ...Object.values(moduleSessions).map((session) => session.getToken),
  getHostelToken,
  getAlumniToken,
  getSalesPurchaseToken,
  getCanteenToken,
  getAdmissionToken,
];

let prefetched = false;

/**
 * Warms every module's SSO session in the background right after login, so
 * clicking into a module doesn't pay for its token exchange on the first
 * request. A module the current user has no role in is EXPECTED to fail
 * here — this is a background warm-up, not a permission check, so failures
 * are swallowed silently (the module's own pages still show their normal
 * "no access"/error state on an actual visit).
 *
 * Safe to call more than once (e.g. on every DashboardLayout mount) — only
 * does real work the first time per page load.
 */
export function prefetchModuleSessions(): void {
  if (prefetched) return;
  prefetched = true;
  for (const getToken of allModuleTokenGetters) {
    getToken().catch(() => {
      // Expected for any module the user isn't provisioned for.
    });
  }
}
