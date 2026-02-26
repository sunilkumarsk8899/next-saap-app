import { PhotoBrowser } from '@/components/photo-browser';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Discover Pexels photos</h1>
      <p className="text-slate-300">Search the Pexels library through a secure server-side proxy.</p>
      <PhotoBrowser isLoggedIn={Boolean(user)} />
    </section>
  );
}
