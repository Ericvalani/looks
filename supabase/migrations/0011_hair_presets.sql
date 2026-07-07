-- Controle do cabelo da modelo, em duas dimensões:
--   hairstyle_presets     -> penteado / como está arrumado (solto, preso, coque,
--                            para frente, para trás, com boné...)
--   hair_texture_presets  -> textura + comprimento (liso, ondulado, cacheado,
--                            um pouco maior/menor...)

create table public.hairstyle_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.hair_texture_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.hairstyle_presets enable row level security;
alter table public.hair_texture_presets enable row level security;

create policy "hairstyle_presets_select_all_authenticated"
  on public.hairstyle_presets for select to authenticated using (true);
create policy "hair_texture_presets_select_all_authenticated"
  on public.hair_texture_presets for select to authenticated using (true);

alter table public.looks
  add column hairstyle_preset_id text references public.hairstyle_presets(id),
  add column hair_texture_preset_id text references public.hair_texture_presets(id);

alter table public.preferences
  add column default_hairstyle_preset_id text references public.hairstyle_presets(id) on delete set null,
  add column default_hair_texture_preset_id text references public.hair_texture_presets(id) on delete set null;

-- Penteado / como o cabelo está arrumado. "como-esta" é o default (mantém o
-- cabelo como na foto de referência).
insert into public.hairstyle_presets (id, label, prompt_fragment, sort_order) values
  ('como-esta', 'Como está', 'Keep her hair exactly as it appears in the reference — same style and arrangement, do not restyle it.', 1),
  ('solto', 'Solto', 'Her hair is worn down and loose, falling naturally around her shoulders.', 2),
  ('para-frente', 'Para frente', 'Her hair is brought forward, falling over the front of her shoulders and framing the front of her body.', 3),
  ('para-tras', 'Para trás', 'Her hair is swept back away from her face, all falling behind her shoulders.', 4),
  ('rabo', 'Preso (rabo)', 'Her hair is tied back in a ponytail, pulled away from the face.', 5),
  ('coque', 'Coque', 'Her hair is up in a neat bun (coque), away from the face and neck.', 6),
  ('meio-preso', 'Meio preso', 'Her hair is in a half-up style — the top pulled back and secured while the rest falls loose.', 7),
  ('trancas', 'Tranças', 'Her hair is styled in braids.', 8),
  ('bone', 'Com boné', 'She is wearing a casual baseball cap, with her hair falling naturally out from under it. IMPORTANT: use exactly one cap — if a specific hat/cap photo was already provided in the head garment zone, use that one instead of adding another.', 9),
  ('bone-rabo', 'Boné + rabo', 'She is wearing a casual baseball cap with her hair pulled back in a ponytail coming out the back of the cap. IMPORTANT: use exactly one cap — if a specific hat/cap photo was already provided in the head garment zone, use that one instead of adding another.', 10)
on conflict (id) do nothing;

-- Textura + comprimento do cabelo. "como-esta" mantém a textura da referência.
insert into public.hair_texture_presets (id, label, prompt_fragment, sort_order) values
  ('como-esta', 'Como está', 'Keep the natural hair texture and length exactly as in the reference.', 1),
  ('liso', 'Liso', 'Her hair is straight and smooth.', 2),
  ('ondulado', 'Ondulado', 'Her hair has soft, natural waves.', 3),
  ('cacheado', 'Cacheado', 'Her hair is curly with defined natural curls.', 4),
  ('mais-curto', 'Um pouco mais curto', 'Her hair is a bit shorter than in the reference, keeping the same overall style.', 5),
  ('mais-longo', 'Um pouco mais longo', 'Her hair is a bit longer than in the reference, keeping the same overall style.', 6)
on conflict (id) do nothing;
