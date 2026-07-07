-- Presets de pose (texto): a modelo sempre segura o iPhone com uma mão
-- (selfie de espelho), então cada preset descreve o que o resto do corpo
-- e a mão livre fazem.

create table public.pose_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.pose_presets enable row level security;

create policy "pose_presets_select_all_authenticated"
  on public.pose_presets for select
  to authenticated
  using (true);

alter table public.looks
  add column pose_preset_id text references public.pose_presets(id);

alter table public.preferences
  add column default_pose_preset_id text references public.pose_presets(id) on delete set null;

insert into public.pose_presets (id, label, prompt_fragment, sort_order) values
  ('neutra', 'Postura neutra', 'Standing naturally and relaxed, facing the mirror directly.', 1),
  ('mao-cintura', 'Mão na cintura', 'Standing confidently with the free hand resting on the hip, weight shifted slightly onto one leg.', 2),
  ('cabelo', 'Mexendo no cabelo', 'The free hand gently touching or running through the hair.', 3),
  ('perna-cruzada', 'Perna cruzada', 'Standing with legs casually crossed at the ankles or knees, relaxed stance.', 4),
  ('mao-bolso', 'Mão no bolso', 'The free hand tucked casually into a pocket.', 5),
  ('corpo-de-lado', 'Corpo de lado', 'Body turned at a three-quarter angle to the mirror, looking back over the shoulder.', 6)
on conflict (id) do nothing;
