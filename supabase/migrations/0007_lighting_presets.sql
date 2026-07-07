-- Presets de iluminação/horário (texto): mesmo cenário real muda de
-- iluminação dependendo da hora — dia (luz natural) ou noite (luz de
-- lâmpada, quente ou fria).

create table public.lighting_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.lighting_presets enable row level security;

create policy "lighting_presets_select_all_authenticated"
  on public.lighting_presets for select
  to authenticated
  using (true);

alter table public.looks
  add column lighting_preset_id text references public.lighting_presets(id);

alter table public.preferences
  add column default_lighting_preset_id text references public.lighting_presets(id) on delete set null;

insert into public.lighting_presets (id, label, prompt_fragment, sort_order) values
  ('dia', 'Dia', 'Bright daytime lighting: natural daylight fills the scene (through windows if indoors, or ambient sunlight if outdoors), clear and well-lit, natural neutral color temperature, soft realistic shadows consistent with daytime.', 1),
  ('noite-quente', 'Noite (luz quente)', 'Nighttime lighting: the scene is lit by warm-toned LED/lamp light (warm white, ~2700-3000K) — cozy, yellowish-orange ambient glow typical of indoor lamps at night. If there are windows, the outside is dark.', 2),
  ('noite-fria', 'Noite (luz fria)', 'Nighttime lighting: the scene is lit by cool-toned LED light (cool white, ~5000-6500K) — crisp, bluish-white ambient light typical of modern cool LED fixtures at night. If there are windows, the outside is dark.', 3)
on conflict (id) do nothing;
