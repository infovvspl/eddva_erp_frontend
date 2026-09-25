import { config } from '../config/env';

const EXPIRY_SKEW_MS = 60_000;

export interface DecodedTokenPayload {
  exp?: number;
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  institute_id?: string;
  user_name?: string;
  [key: string]: unknown;
}

export function decodeToken(token: string): DecodedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(payload: DecodedTokenPayload | null): boolean {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - EXPIRY_SKEW_MS;
}

// A module session token carries institute_id + user_name. A raw EDDVA/ERP
// login token uses instituteId/email instead, so it can't be mistaken for one.
function isModuleSessionPayload(payload: DecodedTokenPayload | null): boolean {
  return !!payload && typeof payload.institute_id === 'string' && typeof payload.user_name === 'string';
}

function getBaseToken(): string {
  return config.apiToken?.trim() || localStorage.getItem('accessToken') || '';
}

export interface ModuleSessionUser {
  user_name?: string;
  user_email?: string;
  role_name?: string;
  is_institute_admin?: boolean;
  [key: string]: unknown;
}

export interface ModuleSessionOptions {
  /** Storage key prefix, e.g. 'library'. */
  name: string;
  /** SSO exchange path relative to the API base, e.g. '/library/auth/sso'. */
  ssoPath: string;
  /** Field of the exchange response that holds the module token, e.g. 'library_token'. */
  tokenField: string;
}

export interface ModuleSession {
  getToken: () => Promise<string>;
  /** Stores a session that the module's own login already issued (no exchange needed). */
  setSession: (token: string, user?: ModuleSessionUser) => void;
  isAuthenticated: () => boolean;
  getUser: () => ModuleSessionUser | null;
  clear: () => void;
}

/**
 * Session handling for a module with its own auth island: the module's API only
 * accepts a module-signed token. It arrives either by exchanging the core (EDDVA)
 * token at the module's SSO endpoint, or straight from the module's own login for
 * staff who have no core account (a "direct" session, recorded as its own source).
 * An exchanged token is cached against the core token it came from, so switching
 * users or tokens never serves a stale session.
 */
export function createModuleSession({ name, ssoPath, tokenField }: ModuleSessionOptions): ModuleSession {
  const tokenKey = `${name}_token`;
  const sourceKey = `${name}_token_source`;
  const userKey = `${name}_user`;
  let inFlight: Promise<string> | null = null;

  function readCached(): string | null {
    const cached = localStorage.getItem(tokenKey);
    const source = localStorage.getItem(sourceKey);
    if (!cached || !source) return null;
    if (isExpired(decodeToken(cached))) return null;

    const isDirectSession = source === cached;
    // A fixed VITE_API_TOKEN is a deliberate override, so it wins over a leftover staff login.
    if (isDirectSession) return config.apiToken?.trim() ? null : cached;
    return source === getBaseToken() ? cached : null;
  }

  function clear(): void {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(sourceKey);
    localStorage.removeItem(userKey);
  }

  function setSession(token: string, user?: ModuleSessionUser): void {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(sourceKey, token);
    if (user) localStorage.setItem(userKey, JSON.stringify(user));
  }

  async function exchange(): Promise<string> {
    const base = getBaseToken();
    if (!base) {
      throw new Error(`No session token available to sign in to ${name}.`);
    }

    // A test token already shaped like a module session (VITE_API_TOKEN) is used as-is.
    const basePayload = decodeToken(base);
    if (isModuleSessionPayload(basePayload) && !isExpired(basePayload)) {
      localStorage.setItem(tokenKey, base);
      localStorage.setItem(sourceKey, base);
      return base;
    }

    const response = await fetch(`${config.apiUrl}${ssoPath}?token=${encodeURIComponent(base)}`);
    const body = await response.json().catch(() => null);
    const moduleToken: unknown = body?.data?.[tokenField];
    if (!response.ok || !body?.success || typeof moduleToken !== 'string') {
      throw new Error(body?.error?.message || `Failed to establish a ${name} session.`);
    }

    localStorage.setItem(tokenKey, moduleToken);
    localStorage.setItem(sourceKey, base);
    if (body.data.user) localStorage.setItem(userKey, JSON.stringify(body.data.user));
    return moduleToken;
  }

  async function getToken(): Promise<string> {
    const cached = readCached();
    if (cached) return cached;
    if (!inFlight) {
      inFlight = exchange().finally(() => {
        inFlight = null;
      });
    }
    return inFlight;
  }

  function getUser(): ModuleSessionUser | null {
    if (!readCached()) return null;
    try {
      const raw = localStorage.getItem(userKey);
      return raw ? (JSON.parse(raw) as ModuleSessionUser) : null;
    } catch {
      return null;
    }
  }

  return { getToken, setSession, isAuthenticated: () => readCached() !== null, getUser, clear };
}
