-- Substitui os presets de cenário fixos (texto) por fotos reais de
-- ambientes enviadas pelo usuário (quarto, elevador, sala...), usadas como
-- referência de imagem na geração — o resultado sempre é uma selfie de
-- espelho estilo iPhone 16 Pro Max nesse ambiente exato.

create table public.scene_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  label text not null,
  created_at timestamptz not null default now()
);

create index scene_photos_user_id_idx on public.scene_photos(user_id);

alter table public.scene_photos enable row level security;

create policy "scene_photos_all_own"
  on public.scene_photos for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- looks: troca scene_preset_id (texto fixo) por scene_photo_id (foto real).
alter table public.looks
  add column scene_photo_id uuid references public.scene_photos(id) on delete restrict;

alter table public.looks
  drop column scene_preset_id;

-- preferences: cenário padrão agora aponta para uma foto, não um preset.
alter table public.preferences
  add column default_scene_photo_id uuid references public.scene_photos(id) on delete set null;

alter table public.preferences
  drop column default_scene_preset_id;

drop table public.scene_presets;
