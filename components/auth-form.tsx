'use client';

import { FormEvent, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/toast-provider';

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { pushToast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) {
        pushToast(error.message, 'error');
        return;
      }

      pushToast(mode === 'login' ? 'Signed in successfully.' : 'Signup successful. Check your email.', 'success');

      const next = searchParams.get('next') ?? '/account';
      router.push(mode === 'login' ? next : '/login');
      router.refresh();
    } catch {
      pushToast('Authentication failed due to a client error. Please refresh the page and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6"
    >
      <h1 className="text-2xl font-semibold">Login or create account</h1>
      <label className="block text-sm">
        Email
        <input
          required
          type="email"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        Password
        <input
          required
          minLength={6}
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          onClick={() => setMode('login')}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
        >
          Sign in
        </button>
        <button
          type="submit"
          disabled={loading}
          onClick={() => setMode('signup')}
          className="rounded bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600 disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
