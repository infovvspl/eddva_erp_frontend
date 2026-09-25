import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, School, User } from 'lucide-react';
import axiosInstance from '../../../lib/axios';
import { findModuleAuth } from '../../../lib/moduleAuth';
import type { ModuleSessionUser } from '../../../lib/moduleSession';
import FormField from '../../../components/forms/FormField';
import FormError from '../../../components/forms/FormError';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const INPUT_CLASS =
  'pl-11 pr-4 py-2.5 w-full rounded-lg bg-slate-50/50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008BE9]/20 focus:border-[#008BE9] transition-all';

function errorMessage(err: unknown): string {
  const response = (err as { response?: { data?: { error?: { message?: string } } } })?.response;
  return response?.data?.error?.message || (err as { message?: string })?.message || 'Login failed';
}

/**
 * Sign-in page for staff of one module (librarians, coaches, accountants and so on) who were
 * given a username and password by their institute admin. One page serves every module; the
 * module comes from the URL, e.g. /library/login.
 *
 * A username is only unique within a school, so the page also accepts a school id: from the
 * link the admin shares (?school=...), or asked for when the server finds the same username
 * in more than one school.
 */
export default function ModuleLoginPage() {
  const { pathname } = useLocation();
  const module = findModuleAuth(pathname);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [school, setSchool] = useState(searchParams.get('school') ?? '');
  const [askSchool, setAskSchool] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!module) return <Navigate to="/login" replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(module.loginApiPath, {
        username: username.trim(),
        password,
        ...(school.trim() ? { institute_id: school.trim() } : {}),
      });
      const data = response.data?.data;
      const token: unknown = data?.[module.tokenField];
      if (typeof token !== 'string') throw new Error('The server did not return a session.');
      module.setSession(token, data.user as ModuleSessionUser | undefined);
      navigate(module.basePath, { replace: true });
    } catch (err) {
      const message = errorMessage(err);
      // The same username exists in more than one school: ask which one.
      if (message.includes('institute_id')) setAskSchool(true);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">{module.label}</h1>
            <p className="mt-2 text-slate-500">Sign in with the username and password from your school</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_10px_40px_rgba(0,44,109,0.08)] sm:p-9">
            <div className="mx-auto mb-7 h-1 w-16 rounded-full bg-[#008BE9]" />

            {error && (
              <div className="mb-6">
                <FormError message={error} />
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <FormField label="Username" required>
                <div className="relative flex items-center">
                  <User className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    autoComplete="username"
                    autoFocus
                    disabled={isLoading}
                    className={INPUT_CLASS}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </FormField>

              <FormField label="Password" required>
                <div className="relative flex items-center">
                  <Lock className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={`${INPUT_CLASS} pr-11`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 text-slate-400 transition-colors hover:text-[#002C6D] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </FormField>

              {askSchool && (
                <FormField label="School ID" required>
                  <div className="relative flex items-center">
                    <School className="pointer-events-none absolute left-3.5 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      disabled={isLoading}
                      className={INPUT_CLASS}
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>
                </FormField>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={isLoading}
                style={{ background: 'linear-gradient(135deg, #002C6D 0%, #008BE9 100%)' }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.99]"
              >
                <span>Sign In</span>
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-500">
              Institute admin?{' '}
              <a href="/login" className="font-semibold text-[#002C6D] hover:text-[#008BE9] hover:underline">
                Sign in via the main portal
              </a>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-sm text-slate-400">© {new Date().getFullYear()} Eddva ERP</footer>
    </div>
  );
}
