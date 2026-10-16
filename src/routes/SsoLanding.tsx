import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { useAuthStore } from '../stores/auth.store';
import { clearAllModuleSessions } from '../lib/moduleAuth';
import { ROUTES } from '../constants/routes';

const BACKSLASH = String.fromCharCode(92);

// Where to send someone whose ERP account has a role in exactly one module
// (resolved server-side in ssoLogin — see auth.service.ts). Library has no
// per-module staff accounts yet, so it never comes back as a defaultModule.
const MODULE_ROUTES: Record<string, string> = {
  accounts: '/accounts/dashboard',
  canteen: '/canteen/dashboard',
  sports: '/sports/dashboard',
  'front-office': '/front-office',
  inventory: '/inventory',
  transport: '/transport/dashboard',
  'sales-purchase': '/sales-purchase/dashboard',
  admission: '/admission/dashboard',
  hostel: '/hostel/dashboard',
  alumni: '/alumni/dashboard',
  staff: '/staff',
};

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
  next: string;
}

// Pure read of the URL fragment; the fragment is cleared later, in the effect.
function readSsoLink(): SsoLink | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const token = params.get('token')?.trim();
  if (!token) return null;
  return { token, next: safeNextPath(params.get('next')) };
}

function extractErrorMessage(err: unknown): string {
  // The backend's global exception filter nests the message under
  // `error.message` (see HttpExceptionFilter), not a top-level `message`.
  const anyErr = err as { response?: { data?: { error?: { message?: string | string[] }; message?: string | string[] } } };
  const message = anyErr?.response?.data?.error?.message ?? anyErr?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? 'Sign-in failed';
  return message ?? 'Sign-in failed';
}

/**
 * Landing page for the LMS hand-off. The LMS opens `/sso#token=<bridge-jwt>&next=<path>`.
 * The token travels in the URL fragment, which browsers never send to servers
 * and which is not written to server logs. It is a one-shot, short-lived
 * bridge token (not a usable session on its own) — this page exchanges it
 * server-side via POST /auth/sso for a real ERP session, then stores that
 * and sends the user to `next`.
 */
export default function SsoLanding() {
  const navigate = useNavigate();
  // Read once on mount so a StrictMode re-run of the effect still sees the link
  // after the fragment has been cleared.
  const [link] = useState(readSsoLink);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Drop the token from the address bar and history straight away.
    window.history.replaceState(null, '', window.location.pathname);
    if (!link) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.post('/auth/sso', { token: link.token });
        const { accessToken, user, defaultModule } = response.data.data ?? response.data;
        if (cancelled) return;

        // Logging out later should send the admin back to the LMS, not to
        // this app's own login page — see handleLogout in UserMenu.tsx.
        try {
          sessionStorage.setItem('ssoOrigin', 'lms');
        } catch {
          // sessionStorage may be unavailable (private mode); logout just
          // falls back to this app's own login page in that case.
        }

        // The admin who just arrived replaces any staff login left in this browser.
        clearAllModuleSessions();
        localStorage.setItem('accessToken', accessToken);
        useAuthStore.getState().setAuth({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.roleName,
        });

        // Only override the generic landing page — a caller asking for
        // something more specific (a deep link) is respected as-is.
        const moduleRoute = defaultModule ? MODULE_ROUTES[defaultModule] : undefined;
        const destination = link.next === ROUTES.DASHBOARD && moduleRoute ? moduleRoute : link.next;
        navigate(destination, { replace: true });
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [link, navigate]);

  if (!link || error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">Could not sign you in</p>
          <p className="mt-2 text-sm text-slate-600">
            {error ?? 'This sign-in link is missing or invalid. Please open the module again from EDDVA.'}
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
