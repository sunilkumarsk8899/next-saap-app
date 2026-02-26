create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pexels_photo_id bigint not null,
  url text not null,
  photographer text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pexels_photo_id)
);

alter table public.favorites enable row level security;

create policy "Users can read their favorites"
on public.favorites
for select
using (auth.uid() = user_id);

create policy "Users can insert their favorites"
on public.favorites
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their favorites"
on public.favorites
for delete
using (auth.uid() = user_id);
