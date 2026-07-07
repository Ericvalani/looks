-- 1) Opção "Como está" no ambiente: mantém o cenário exatamente como aparece
--    na foto/descrição de cenário, sem arrumar nem bagunçar nada.
insert into public.environment_presets (id, label, prompt_fragment, sort_order) values
  ('como-esta', 'Como está', 'Do not change the state of the environment at all — keep the room/space exactly as it already is in the scene, without tidying, messing up, adding or removing anything.', 0)
on conflict (id) do nothing;

-- 2) Cenários por TEXTO (scene_presets): lugares descritos, sem precisar de foto.
--    O usuário pode escolher UMA foto real de cenário (scene_photos) OU um
--    destes cenários prontos. Todos são lugares comuns no Brasil.
create table public.scene_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.scene_presets enable row level security;

create policy "scene_presets_select_all_authenticated"
  on public.scene_presets for select to authenticated using (true);

alter table public.looks
  add column scene_preset_id text references public.scene_presets(id);

alter table public.preferences
  add column default_scene_preset_id text references public.scene_presets(id) on delete set null;

insert into public.scene_presets (id, label, prompt_fragment, sort_order) values
  ('restaurante-chique', 'Restaurante chique', 'An upscale, elegant restaurant in Brazil: warm ambient lighting, set tables with white tablecloths and wine glasses, refined decor, tasteful plants and soft background bokeh of other diners. A sophisticated, well-dressed atmosphere.', 1),
  ('cafeteria', 'Cafeteria', 'A cozy, trendy Brazilian coffee shop (cafeteria): wooden tables, exposed bulbs, a coffee counter with an espresso machine in the background, chalkboard menus, plants, a relaxed hipster café vibe with soft daylight through large windows.', 2),
  ('elevador', 'Elevador', 'Inside a modern residential/commercial elevator in Brazil: brushed metal or mirrored stainless-steel walls, subtle ceiling lighting, the floor-number panel visible — the classic elevator mirror-selfie setting.', 3),
  ('parque-municipal', 'Parque municipal', 'A municipal park in Brazil on a bright day: green lawns, tall leafy trees, a paved walking path, a few benches, tropical vegetation, natural daylight, a calm outdoor city-park atmosphere.', 4),
  ('shopping', 'Shopping', 'Inside a large modern Brazilian shopping mall: bright polished floors, glass storefronts and store signs softly out of focus in the background, escalators and clean contemporary architecture, plenty of ambient light.', 5),
  ('praia', 'Praia', 'A Brazilian beach setting: golden sand, the sea and horizon behind, bright natural sunlight, a few palm trees or a kiosk softly in the background, a warm summery coastal atmosphere.', 6),
  ('rua-arborizada', 'Rua arborizada', 'A charming tree-lined street in a Brazilian city: sidewalk with leafy trees, low houses or small shops, parked cars softly out of focus, warm late-afternoon daylight — a candid street-style backdrop.', 7),
  ('rooftop', 'Rooftop', 'A stylish rooftop bar/terrace in a Brazilian city at golden hour: a skyline of buildings in the soft-focus background, string lights, lounge seating and plants, a warm sunset glow.', 8),
  ('academia', 'Academia', 'Inside a modern gym in Brazil: rows of exercise machines and free weights, mirrored walls, rubber flooring and bright even lighting — a fitness/workout setting.', 9),
  ('banheiro-lounge', 'Lavabo de balada', 'A stylish nightclub/bar restroom lounge in Brazil: large mirror with warm flattering lights, modern tiles, moody accent lighting — the classic going-out mirror-selfie spot.', 10)
on conflict (id) do nothing;
