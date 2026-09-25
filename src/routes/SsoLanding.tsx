import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { decodeToken } from '../lib/moduleSession';
import { clearAllModuleSessions } from '../lib/moduleAuth';
import type { DecodedTokenPayload } from '../lib/moduleSession';
import { ROUTES } from '../constants/routes';

const BACKSLASH = String.fromCharCode(92);

// Only same-app absolute paths: a `next` like //evil.com or https://evil.com
// must never turn this page into an open redirect.
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes(BACKSLASH)) {
    return ROUTES.DASHBOARD;
  }
  return next;
}

interface SsoLink {
  token: string;
  payload: DecodedTokenPayload;
  next: string;
}

// Pure read of the URL fragment; the fragment is cleared later, in the effect.
function readSsoLink(): SsoLink | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = params.get('token')?.trim();
  const payload = token ? decodeToken(token) : null;
  if (!token || !payload) return null;
  return { token, payload, next: safeNextPath(params.get('next')) };
}

/**
 * Landing page for the LMS hand-off. The LMS opens `/sso#token=<jwt>&next=<path>`.
 * The token travels in the URL fragment, which browsers never send to servers
 * and which is not written to server logs. It is stored as the core session
 * token, removed from the address bar, and the user is sent to `next`. The module
 * then exchanges it for its own token on the first API call.
 */
export default function SsoLanding() {
  const navigate = useNavigate();
  // Read once on mount so a StrictMode re-run of the effect still sees the link
  // after the fragment has been cleared.
  const [link] = useState(readSsoLink);

  useEffect(() => {
    // Drop the token from the address bar and history straight away.
    window.history.replaceState(null, '', window.location.pathname);
    if (!link) return;

    // The admin who just arrived replaces any staff login left in this browser.
    clearAllModuleSessions();
    localStorage.setItem('accessToken', link.token);
    useAuthStore.getState().setAuth({
      id: String(link.payload.id ?? link.payload.sub ?? ''),
      email: String(link.payload.email ?? ''),
      name: String(link.payload.name ?? link.payload.email ?? 'Institute Admin'),
      role: typeof link.payload.role === 'string' ? link.payload.role : undefined,
    });
    navigate(link.next, { replace: true });
  }, [link, navigate]);

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">Could not sign you in</p>
          <p className="mt-2 text-sm text-slate-600">
            This sign-in link is missing or invalid. Please open the module again from EDDVA.
          </p>
          <button
            type="button"
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Signing you in…</div>
  );
}
