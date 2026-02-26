import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountPanel } from '@/components/account-panel';

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return <AccountPanel email={user.email ?? ''} initialFavorites={favorites ?? []} />;
}
