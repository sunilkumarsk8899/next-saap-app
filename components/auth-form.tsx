'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/toast-provider';

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleSubmit = async (event: FormEvent, mode: 'login' | 'signup') => {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const action = mode === 'login' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await action({ email, password });

    setLoading(false);

    if (error) {
      pushToast(error.message, 'error');
      return;
    }

    pushToast(mode === 'login' ? 'Signed in successfully.' : 'Signup successful. Check your email.', 'success');

    const next = searchParams.get('next') ?? '/account';
    router.push(mode === 'login' ? next : '/login');
    router.refresh();
  };

  return (
    <form className="mx-auto max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6">
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
          className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <div className="flex gap-3">
        <button
          disabled={loading}
          onClick={(event) => handleSubmit(event, 'login')}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
        >
          Sign in
        </button>
        <button
          disabled={loading}
          onClick={(event) => handleSubmit(event, 'signup')}
          className="rounded bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600 disabled:opacity-60"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}
