'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button onClick={signOut} className="rounded bg-slate-700 px-3 py-2 font-medium hover:bg-slate-600">
      Sign out
    </button>
  );
}
