import { createModuleSession } from './moduleSession';
import type { ModuleSession, ModuleSessionUser } from './moduleSession';
import {
  clearHostelSession,
  getCachedHostelUser,
  isHostelAuthenticated,
  setHostelSession,
} from '../features/hostel/utils/ssoSession';
import {
  clearAlumniSession,
  getCachedAlumniUser,
  isAlumniAuthenticated,
  setAlumniSession,
} from '../features/alumni/utils/ssoSession';
import {
  clearSalesPurchaseToken,
  getCachedSalesPurchaseUser,
  isSalesPurchaseAuthenticated,
  setSalesPurchaseSession,
} from '../features/sales-purchase/utils/ssoSession';
import { clearCanteenSession } from '../features/canteen/utils/ssoSession';
import { clearAdmissionSession } from '../features/admission/utils/ssoSession';

// Sessions for the modules whose backend only accepts a module-signed token and that
// have no session helper of their own. Used by the axios interceptor and the login page.
export const moduleSessions = {
  library: createModuleSession({ name: 'library', ssoPath: '/library/auth/sso', tokenField: 'library_token' }),
  sports: createModuleSession({ name: 'sports', ssoPath: '/sports/auth/sso', tokenField: 'sports_token' }),
  accounts: createModuleSession({ name: 'accounts', ssoPath: '/accounts/auth/sso', tokenField: 'accounts_token' }),
  transport: createModuleSession({ name: 'transport', ssoPath: '/transport/auth/sso', tokenField: 'transport_token' }),
  inventory: createModuleSession({ name: 'inventory', ssoPath: '/inventory/auth/sso', tokenField: 'inventory_token' }),
  frontOffice: createModuleSession({ name: 'front_office', ssoPath: '/front-office/auth/sso', tokenField: 'front_office_token' }),
};

/** What the shared login page and route guards need to know about one module. */
export interface ModuleAuth {
  label: string;
  /** Route prefix, e.g. '/library'. The login page lives at `${basePath}/login`. */
  basePath: string;
  /** Module login endpoint relative to the API base. */
  loginApiPath: string;
  /** Field of the login response that holds the module token. */
  tokenField: string;
  isAuthenticated: () => boolean;
  setSession: (token: string, user?: ModuleSessionUser) => void;
  getUser: () => ModuleSessionUser | null;
  clear: () => void;
}

function fromSession(label: string, basePath: string, slug: string, tokenField: string, session: ModuleSession): ModuleAuth {
  return {
    label,
    basePath,
    loginApiPath: `/${slug}/auth/login`,
    tokenField,
    isAuthenticated: session.isAuthenticated,
    setSession: session.setSession,
    getUser: session.getUser,
    clear: session.clear,
  };
}

export const moduleAuthList: ModuleAuth[] = [
  fromSession('Library', '/library', 'library', 'library_token', moduleSessions.library),
  fromSession('Sports', '/sports', 'sports', 'sports_token', moduleSessions.sports),
  fromSession('Accounts', '/accounts', 'accounts', 'accounts_token', moduleSessions.accounts),
  fromSession('Transport', '/transport', 'transport', 'transport_token', moduleSessions.transport),
  fromSession('Inventory', '/inventory', 'inventory', 'inventory_token', moduleSessions.inventory),
  fromSession('Front Office', '/front-office', 'front-office', 'front_office_token', moduleSessions.frontOffice),
  {
    label: 'Hostel',
    basePath: '/hostel',
    loginApiPath: '/hostel/auth/login',
    tokenField: 'hostel_token',
    isAuthenticated: isHostelAuthenticated,
    setSession: (token, user) => setHostelSession(token, user ?? {}),
    getUser: () => getCachedHostelUser() as ModuleSessionUser | null,
    clear: clearHostelSession,
  },
  {
    label: 'Alumni',
    basePath: '/alumni',
    loginApiPath: '/alumni/auth/login',
    tokenField: 'alumni_token',
    isAuthenticated: isAlumniAuthenticated,
    setSession: (token, user) => setAlumniSession(token, (user ?? {}) as never),
    getUser: () => getCachedAlumniUser() as ModuleSessionUser | null,
    clear: clearAlumniSession,
  },
  {
    label: 'Sales & Purchase',
    basePath: '/sales-purchase',
    loginApiPath: '/sales-purchase/auth/login',
    tokenField: 'sales_purchase_token',
    isAuthenticated: isSalesPurchaseAuthenticated,
    setSession: (token, user) => setSalesPurchaseSession(token, user ?? {}),
    getUser: () => getCachedSalesPurchaseUser() as ModuleSessionUser | null,
    clear: clearSalesPurchaseToken,
  },
];

/** The module whose login this URL belongs to, e.g. '/library/books' -> Library. */
export function findModuleAuth(pathname: string): ModuleAuth | undefined {
  return moduleAuthList.find((m) => pathname === m.basePath || pathname.startsWith(m.basePath + '/'));
}

/**
 * A fresh core (EDDVA) login replaces every leftover module staff session, so a staff
 * login left in the browser can never override the admin who just signed in.
 */
export function clearAllModuleSessions(): void {
  moduleAuthList.forEach((m) => m.clear());
  clearCanteenSession();
  clearAdmissionSession();
}
