-- Mais presets de texto para controlar a geração:
--   expression_presets  -> rosto/expressão (sorrindo, língua para fora, etc.)
--   direction_presets   -> de frente / de costas
--   environment_presets -> estado do ambiente (arrumado, bagunçado, pessoas ao fundo...)

create table public.expression_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.direction_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.environment_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.expression_presets enable row level security;
alter table public.direction_presets enable row level security;
alter table public.environment_presets enable row level security;

create policy "expression_presets_select_all_authenticated"
  on public.expression_presets for select to authenticated using (true);
create policy "direction_presets_select_all_authenticated"
  on public.direction_presets for select to authenticated using (true);
create policy "environment_presets_select_all_authenticated"
  on public.environment_presets for select to authenticated using (true);

alter table public.looks
  add column expression_preset_id text references public.expression_presets(id),
  add column direction_preset_id text references public.direction_presets(id),
  add column environment_preset_id text references public.environment_presets(id);

alter table public.preferences
  add column default_expression_preset_id text references public.expression_presets(id) on delete set null,
  add column default_direction_preset_id text references public.direction_presets(id) on delete set null,
  add column default_environment_preset_id text references public.environment_presets(id) on delete set null;

insert into public.expression_presets (id, label, prompt_fragment, sort_order) values
  ('neutra', 'Neutra', 'Neutral, relaxed facial expression, mouth closed, looking naturally toward the mirror.', 1),
  ('sorrindo', 'Sorrindo', 'Smiling naturally and warmly.', 2),
  ('lingua-fora', 'Língua para fora', 'Playfully sticking her tongue out, fun and casual.', 3),
  ('cabeca-inclinada', 'Cabeça inclinada', 'Head gently tilted to one side, relaxed and candid.', 4),
  ('seria', 'Séria', 'Serious, confident expression, calm and composed.', 5)
on conflict (id) do nothing;

insert into public.direction_presets (id, label, prompt_fragment, sort_order) values
  ('frente', 'De frente', 'The person faces the mirror directly, front of the outfit visible in the reflection.', 1),
  ('costas', 'De costas', 'The person has her back to the mirror, showing the back of the outfit, glancing over her shoulder toward the mirror as in a real mirror selfie.', 2),
  ('lado', 'De lado', 'The person is turned at a three-quarter/side angle to the mirror, showing the outfit from the side.', 3)
on conflict (id) do nothing;

insert into public.environment_presets (id, label, prompt_fragment, sort_order) values
  ('arrumado', 'Arrumado', 'The room is clean, tidy and organized, nothing out of place.', 1),
  ('pouco-bagunçado', 'Pouco bagunçado', 'The room is slightly messy — a couple of small everyday things out of place, lived-in but not chaotic.', 2),
  ('tenis-no-chao', 'Tênis no chão', 'A pair of sneakers casually lying on the floor of the room.', 3),
  ('roupa-na-cama', 'Roupa na cama', 'Some clothes tossed on top of the bed, as if she was choosing an outfit.', 4),
  ('pessoas-ao-fundo', 'Pessoas ao fundo', 'One or two other people softly visible in the background, out of focus, casual.', 5),
  ('decorado', 'Decorado', 'The space is decorated with plants, framed pictures and cozy details.', 6),
  ('minimalista', 'Minimalista', 'A very clean, minimal, almost empty space with lots of negative space.', 7),
  ('festa', 'Clima de festa', 'Party vibe in the background — subtle string lights, a few decorations, warm festive mood.', 8)
on conflict (id) do nothing;
