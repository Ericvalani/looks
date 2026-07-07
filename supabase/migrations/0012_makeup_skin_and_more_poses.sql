-- Mais controles + poses:
--   makeup_presets -> maquiagem (nenhuma, natural, leve, glam, sexy...)
--   skin_presets   -> estado da pele / marca de sol no rosto e no corpo
-- E novos inserts em pose_presets e hand_presets (poses/gestos realistas).

create table public.makeup_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.skin_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.makeup_presets enable row level security;
alter table public.skin_presets enable row level security;

create policy "makeup_presets_select_all_authenticated"
  on public.makeup_presets for select to authenticated using (true);
create policy "skin_presets_select_all_authenticated"
  on public.skin_presets for select to authenticated using (true);

alter table public.looks
  add column makeup_preset_id text references public.makeup_presets(id),
  add column skin_preset_id text references public.skin_presets(id);

alter table public.preferences
  add column default_makeup_preset_id text references public.makeup_presets(id) on delete set null,
  add column default_skin_preset_id text references public.skin_presets(id) on delete set null;

-- Maquiagem. "como-esta" mantém a maquiagem da referência (default).
insert into public.makeup_presets (id, label, prompt_fragment, sort_order) values
  ('como-esta', 'Como está', 'Keep her makeup exactly as it appears in the reference — do not add or remove makeup.', 1),
  ('sem', 'Sem maquiagem', 'She wears no makeup at all — completely natural, bare skin with its real texture.', 2),
  ('natural', 'Natural', 'Very light, natural "no-makeup" makeup: even skin, subtle tone, nothing bold.', 3),
  ('leve', 'Leve do dia a dia', 'Light everyday makeup: a bit of mascara, natural blush and a soft nude lip.', 4),
  ('glam', 'Glam / noite', 'Glamorous evening makeup: defined eyes, some contour, and a bolder lip.', 5),
  ('sexy', 'Sexy', 'Sultry makeup: smoky, well-defined eyes, glowing skin and a sensual lip.', 6),
  ('boca-marcada', 'Batom marcante', 'Natural skin makeup with a bold, striking lipstick as the focal point.', 7)
on conflict (id) do nothing;

-- Estado da pele / marca de sol (rosto e corpo). "como-esta" = pele da referência.
insert into public.skin_presets (id, label, prompt_fragment, sort_order) values
  ('como-esta', 'Como está', 'Keep her skin tone and any tan lines exactly as in the reference.', 1),
  ('sem-marca', 'Sem marca de sol', 'Even, uniform skin tone with no tan lines anywhere on the face or body.', 2),
  ('bronzeada', 'Bronzeada', 'A healthy, even sun-kissed tan across her face and body, no harsh tan lines.', 3),
  ('rosto-sol', 'Rosto marcado de sol', 'Her face looks lightly sun-kissed — a natural warm flush across the cheeks and nose from being in the sun, subtle and realistic.', 4),
  ('corpo-marca', 'Marca de sol no corpo', 'Visible natural tan lines on her body (for example lighter skin where a swimsuit/straps would sit) contrasting with sun-tanned areas, realistic.', 5),
  ('rosto-corpo-sol', 'Sol no rosto e corpo', 'A realistic overall sun-tanned look with a lightly sun-flushed face and natural tan lines on the body.', 6)
on conflict (id) do nothing;

-- Novas poses realistas (a tabela pose_presets já existe).
insert into public.pose_presets (id, label, prompt_fragment, sort_order) values
  ('mao-cintura', 'Mão na cintura', 'The free hand rests on her hip, elbow out, in a confident, natural stance.', 20),
  ('perna-atras', 'Perna para trás', 'She playfully lifts one foot up behind her, bending the knee so the lower leg kicks up behind (the classic flirty "princess" kick pose), balanced and natural.', 21),
  ('pernas-cruzadas-cintura', 'Pernas cruzadas + mão na cintura', 'She stands with her legs casually crossed at the ankles and the free hand on her hip, relaxed and poised.', 22),
  ('olhar-de-baixo', 'Olhar de baixo (sensual)', 'She tilts her head slightly down and looks up toward the camera with a subtle, slightly sultry gaze and a very small, soft smile.', 23),
  ('mao-tapando-sol', 'Mão tapando o sol', 'She raises her free hand to her forehead to shade her eyes from the sun, looking off to the side or slightly downward, squinting a little in a natural, candid way.', 24),
  ('olhando-lateral', 'Olhando para o lado', 'She looks away to the side rather than at the camera, chin slightly turned, in a relaxed candid moment.', 25)
on conflict (id) do nothing;

-- "Mão na cintura" também como gesto da mão livre.
insert into public.hand_presets (id, label, prompt_fragment, sort_order) values
  ('mao-cintura', 'Mão na cintura', 'The free hand rests on her hip with the elbow out, a confident natural pose.', 13)
on conflict (id) do nothing;
