import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import { getEnabledModulePaths } from '../api/erpModules.api';

/**
 * Which top-level module paths (e.g. '/canteen') this institute currently
 * has enabled, as set by a super admin in the LMS. `null` means "not
 * restricted" (LMS integration not configured, or the institute has no
 * module catalogue set up yet) — callers should treat that as "show
 * everything", not as "show nothing".
 */
export function useEnabledModules() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['erp-modules', 'enabled'],
    queryFn: getEnabledModulePaths,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
