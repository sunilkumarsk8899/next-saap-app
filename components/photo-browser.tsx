'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PexelsPhoto } from '@/lib/types';
import { useToast } from '@/components/toast-provider';

type PhotoBrowserProps = {
  isLoggedIn: boolean;
};

export function PhotoBrowser({ isLoggedIn }: PhotoBrowserProps) {
  const [query, setQuery] = useState('nature');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { pushToast } = useToast();

  const endpoint = useMemo(() => (query.trim() ? 'search' : 'curated'), [query]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const loadFavorites = async () => {
      const res = await fetch('/api/favorites');
      if (!res.ok) return;
      const json = await res.json();
      const favoriteIds = new Set<number>(json.favorites.map((item: { pexels_photo_id: number }) => item.pexels_photo_id));
      setFavorites(favoriteIds);
    };

    void loadFavorites();
  }, [isLoggedIn]);

  const loadPhotos = async (searchText: string) => {
    setLoading(true);
    const params = new URLSearchParams({ per_page: '12', page: '1' });

    if (searchText.trim()) {
      params.set('endpoint', 'search');
      params.set('q', searchText);
      const res = await fetch(`/api/pexels?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error ?? 'Failed to fetch photos', 'error');
      } else {
        setPhotos(json.photos ?? []);
      }
      setLoading(false);
      return;
    }

    params.set('endpoint', 'curated');
    const res = await fetch(`/api/pexels?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) {
      pushToast(json.error ?? 'Failed to fetch photos', 'error');
    } else {
      setPhotos(json.photos ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPhotos(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    await loadPhotos(query);
  };

  const toggleFavorite = async (photo: PexelsPhoto) => {
    if (!isLoggedIn) return;

    const currentlySaved = favorites.has(photo.id);
    const next = new Set(favorites);

    if (currentlySaved) {
      next.delete(photo.id);
    } else {
      next.add(photo.id);
    }

    setFavorites(next);

    const res = await fetch(currentlySaved ? `/api/favorites?photo_id=${photo.id}` : '/api/favorites', {
      method: currentlySaved ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: currentlySaved
        ? undefined
        : JSON.stringify({
            pexels_photo_id: photo.id,
            url: photo.url,
            photographer: photo.photographer
          })
    });

    if (!res.ok) {
      setFavorites(favorites);
      const json = await res.json();
      pushToast(json.error ?? 'Failed to update favorite', 'error');
      return;
    }

    pushToast(currentlySaved ? 'Favorite removed' : 'Favorite saved', 'success');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submitSearch} className="flex gap-2">
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
          placeholder="Search photos (leave empty for curated)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">Search</button>
      </form>

      {loading ? <p className="animate-pulse">Loading photos...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const saved = favorites.has(photo.id);
          return (
            <article key={photo.id} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
              <Image src={photo.src.medium} alt={photo.photographer} width={600} height={400} className="h-56 w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="text-sm text-slate-300">By {photo.photographer}</p>
                <button
                  disabled={!isLoggedIn}
                  onClick={() => toggleFavorite(photo)}
                  className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {saved ? 'Remove favorite' : 'Save'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!photos.length && !loading ? <p className="text-slate-400">No photos found.</p> : null}
      {endpoint === 'search' ? null : <p className="text-xs text-slate-500">Showing curated photos.</p>}
    </div>
  );
}
