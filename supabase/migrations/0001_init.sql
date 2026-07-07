-- Schema inicial: gerador de looks (Eric & Mateus)
-- Duas contas fixas de auth (seedadas via scripts/seed.ts) + isolamento total via RLS.

create extension if not exists pgcrypto;

create type public.garment_zone as enum (
  'cabeca', 'casaco', 'topo', 'inferior', 'calcado', 'acessorio'
);

-- ---------------------------------------------------------------------------
-- profiles: uma linha por conta fixa (Eric / Mateus), criada só pelo seed.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  accent_color text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- model_photos
-- ---------------------------------------------------------------------------
create table public.model_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  label text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index model_photos_user_id_idx on public.model_photos(user_id);

alter table public.model_photos enable row level security;

create policy "model_photos_all_own"
  on public.model_photos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- garment_photos
-- ---------------------------------------------------------------------------
create table public.garment_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  zone public.garment_zone not null,
  storage_path text not null,
  label text,
  created_at timestamptz not null default now()
);

create index garment_photos_user_zone_idx on public.garment_photos(user_id, zone);

alter table public.garment_photos enable row level security;

create policy "garment_photos_all_own"
  on public.garment_photos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- scene_presets: dado compartilhado (não é por usuário), somente leitura no app.
-- ---------------------------------------------------------------------------
create table public.scene_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.scene_presets enable row level security;

create policy "scene_presets_select_all_authenticated"
  on public.scene_presets for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- looks
-- ---------------------------------------------------------------------------
create table public.looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  model_photo_id uuid not null references public.model_photos(id) on delete restrict,
  scene_preset_id text references public.scene_presets(id),
  prompt text not null,
  size text not null default '1024x1792',
  quality text not null default 'high',
  storage_path text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index looks_user_created_idx on public.looks(user_id, created_at desc);

alter table public.looks enable row level security;

create policy "looks_all_own"
  on public.looks for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- look_garments: snapshot das peças usadas em cada look (sobrevive à exclusão
-- da peça original da biblioteca).
-- ---------------------------------------------------------------------------
create table public.look_garments (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references public.looks(id) on delete cascade,
  garment_photo_id uuid references public.garment_photos(id) on delete set null,
  zone public.garment_zone not null,
  storage_path_snapshot text not null,
  created_at timestamptz not null default now(),
  unique (look_id, zone)
);

create index look_garments_look_id_idx on public.look_garments(look_id);

alter table public.look_garments enable row level security;

create policy "look_garments_select_via_look"
  on public.look_garments for select
  to authenticated
  using (exists (
    select 1 from public.looks l
    where l.id = look_garments.look_id and l.user_id = auth.uid()
  ));

create policy "look_garments_insert_via_look"
  on public.look_garments for insert
  to authenticated
  with check (exists (
    select 1 from public.looks l
    where l.id = look_garments.look_id and l.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- preferences
-- ---------------------------------------------------------------------------
create table public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_model_photo_id uuid references public.model_photos(id) on delete set null,
  default_scene_preset_id text references public.scene_presets(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.preferences enable row level security;

create policy "preferences_all_own"
  on public.preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: bucket privado único, isolado por pasta {uid}/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('user-content', 'user-content', false)
on conflict (id) do nothing;

create policy "user_content_select_own"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user_content_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user_content_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "user_content_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Seed: presets de cenário
-- ---------------------------------------------------------------------------
insert into public.scene_presets (id, label, prompt_fragment, sort_order) values
  ('estudio', 'Estúdio', 'Clean minimalist photo studio background, soft neutral seamless backdrop, professional but natural studio lighting.', 1),
  ('rua', 'Rua', 'Outdoors on a city street, natural daylight, candid street-style photography background with soft bokeh.', 2),
  ('casa', 'Casa', 'Indoors at home, natural window light, cozy minimal living space background.', 3),
  ('espelho', 'Espelho', 'Mirror selfie taken with a phone, slight natural mirror reflection, bathroom or bedroom mirror setting.', 4)
on conflict (id) do nothing;
