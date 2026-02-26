'use client';

import { useState } from 'react';
import type { Favorite } from '@/lib/types';
import { useToast } from '@/components/toast-provider';

export function AccountPanel({
  email,
  initialFavorites
}: {
  email: string;
  initialFavorites: Favorite[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const { pushToast } = useToast();

  const removeFavorite = async (photoId: number) => {
    const previous = favorites;
    setFavorites((current) => current.filter((item) => item.pexels_photo_id !== photoId));

    const response = await fetch(`/api/favorites?photo_id=${photoId}`, { method: 'DELETE' });

    if (!response.ok) {
      setFavorites(previous);
      pushToast('Failed to remove favorite.', 'error');
      return;
    }

    pushToast('Favorite removed.', 'success');
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-slate-300">Signed in as {email}</p>

      <div className="space-y-3">
        <h2 className="text-xl font-medium">Favorites</h2>
        {!favorites.length ? <p className="text-slate-400">No favorites yet.</p> : null}
        <ul className="space-y-2">
          {favorites.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded border border-slate-800 bg-slate-900 p-3">
              <div>
                <p className="font-medium">Photo #{item.pexels_photo_id}</p>
                <p className="text-sm text-slate-400">{item.photographer}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-300 hover:underline">
                  View
                </a>
                <button
                  onClick={() => removeFavorite(item.pexels_photo_id)}
                  className="rounded bg-rose-600 px-3 py-1.5 text-sm font-medium hover:bg-rose-500"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
