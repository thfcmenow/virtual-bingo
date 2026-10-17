import { cookies } from 'next/headers';
import { authenticateAdmin } from './actions';
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from './auth';
import AdminPageClient from './page_client';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const password = process.env.ADMIN_PASSWORD;

  if (password) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (sessionToken && isValidAdminSessionToken(sessionToken, password)) {
      return <AdminPageClient />;
    }
  }

  const { error } = await searchParams;
  const passwordNotConfigured = !password || error === 'not-configured';

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <section className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Presenter Console
          </span>
          <h1 className="mt-2 text-2xl font-black text-white">Admin access</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter the admin password to continue.
          </p>
        </div>

        {passwordNotConfigured ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200"
          >
            Admin access is not configured. Set <code>ADMIN_PASSWORD</code> on the server.
          </p>
        ) : (
          <>
            {error === 'invalid-password' && (
              <p
                role="alert"
                className="mb-4 rounded-lg border border-rose-800 bg-rose-950/50 p-3 text-sm text-rose-200"
              >
                Incorrect password. Please try again.
              </p>
            )}
            <form action={authenticateAdmin} className="space-y-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                autoComplete="current-password"
                autoFocus
                id="password"
                name="password"
                required
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Continue
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
