import { mintLmsSsoTokenApi } from '../features/auth/api/auth.api';

/**
 * The reverse of the LMS's openErp() helper: mints a short-lived bridge
 * token server-side (admin-only — see mintLmsSsoToken in the ERP backend),
 * then does a full-page navigation to the LMS app's /school/sso landing
 * route, passing the token in the URL fragment.
 */
export async function openLms(path = '/school/admin'): Promise<void> {
  const { token } = await mintLmsSsoTokenApi();
  const lmsFrontendUrl = import.meta.env.VITE_LMS_FRONTEND_URL || 'http://localhost:8080';
  const targetUrl = `${lmsFrontendUrl}/school/sso#token=${encodeURIComponent(token)}&next=${encodeURIComponent(path)}`;
  window.location.href = targetUrl;
}
