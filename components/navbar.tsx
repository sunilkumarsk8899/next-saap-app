import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/sign-out-button';

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-indigo-300">
          Pexels Finder
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-indigo-300">
            Home
          </Link>
          <Link href="/account" className="hover:text-indigo-300">
            Account
          </Link>
          {user ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="rounded bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
