-- Mais dois presets de texto para controlar a geração:
--   hand_presets -> o que a mão livre está fazendo/segurando
--                   (bolsa, livros, mochila, garrafa Stanley rosa, sinal de paz…)
--   shot_presets -> como a foto é tirada / o "tipo" de foto
--                   (selfie no espelho [padrão], selfie normal, apoiada na mesa,
--                    foto traseira 0.5x, de cima para baixo, etc.)

create table public.hand_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);
create table public.shot_presets (
  id text primary key,
  label text not null,
  prompt_fragment text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

alter table public.hand_presets enable row level security;
alter table public.shot_presets enable row level security;

create policy "hand_presets_select_all_authenticated"
  on public.hand_presets for select to authenticated using (true);
create policy "shot_presets_select_all_authenticated"
  on public.shot_presets for select to authenticated using (true);

alter table public.looks
  add column hand_preset_id text references public.hand_presets(id),
  add column shot_preset_id text references public.shot_presets(id);

alter table public.preferences
  add column default_hand_preset_id text references public.hand_presets(id) on delete set null,
  add column default_shot_preset_id text references public.shot_presets(id) on delete set null;

-- What the free hand is doing / holding.
insert into public.hand_presets (id, label, prompt_fragment, sort_order) values
  ('nada', 'Nada', 'The free hand is empty and rests in a natural, relaxed position (at her side, on her thigh, or gently near her body) — it is not holding, wearing or gesturing with anything. Do not add any object, bag, gesture or prop to this hand.', 1),
  ('paz', 'Sinal de paz', 'The free hand makes a relaxed peace sign (two fingers up) toward the mirror, a casual blogger pose.', 2),
  ('coracao', 'Coraçãozinho', 'The free hand makes a small finger-heart gesture, cute and casual.', 3),
  ('joia', 'Joinha', 'The free hand gives a subtle thumbs-up.', 4),
  ('bolsa', 'Bolsa', 'The free hand holds a stylish handbag by its strap, letting it hang naturally, as a real fashion accessory to the outfit.', 5),
  ('bolsa-ombro', 'Bolsa no ombro', 'A stylish shoulder bag hangs from her shoulder while the free hand rests naturally near it.', 6),
  ('mochila', 'Mochila', 'She wears a casual backpack on one shoulder, the free hand holding its strap.', 7),
  ('livros', 'Livros', 'The free hand holds a small stack of books hugged casually against her side.', 8),
  ('stanley-rosa', 'Garrafa Stanley (rosa)', 'The free hand holds a pink Stanley tumbler water bottle (the tall insulated cup with a handle and straw), held casually as an everyday accessory.', 9),
  ('cafe', 'Café', 'The free hand holds a takeaway coffee cup casually.', 10),
  ('celular-extra', 'Outro celular', 'The free hand loosely holds a second phone or small clutch, casual.', 11),
  ('oculos', 'Óculos de sol', 'The free hand holds a pair of sunglasses.', 12)
on conflict (id) do nothing;

-- How the photo is taken (the shot type). "espelho" is the app's default.
insert into public.shot_presets (id, label, prompt_fragment, sort_order) values
  ('espelho', 'Foto no espelho', 'This is a real mirror selfie: she is standing in front of a mirror holding an iPhone 16 Pro Max vertically in one hand, with the BACK of the phone (the rear camera) facing the mirror to take the photo. In the mirror reflection we see her holding the phone up, its back/camera pointing toward the mirror, and the phone partially covering part of her face — exactly the way people really take mirror selfies. The screen faces her, not the mirror.', 1),
  ('selfie', 'Selfie na mão', 'This is a normal handheld selfie taken at arm''s length with the front camera (no mirror): the framing is closer, slightly from above, with the classic extended-arm selfie perspective. No mirror and no phone are visible in the frame.', 2),
  ('apoiado-mesa', 'Apoiada na mesa', 'This looks like a photo taken by a phone propped up on a table or shelf with a self-timer: a stable, slightly low, straight-on full-body framing. No mirror, no visible phone, and both hands are free.', 3),
  ('traseira-05x', 'Traseira 0.5x', 'This is taken by another person using the rear ultra-wide 0.5x lens: a wide-angle full-body shot with the mild ultra-wide perspective and slight edge distortion typical of a 0.5x photo. No mirror and no phone in frame; both hands are free.', 4),
  ('de-cima', 'De cima para baixo', 'This is taken by someone standing slightly above, shooting downward at a high angle toward her — a flattering top-down full-body perspective. No mirror and no phone in frame; both hands are free.', 5),
  ('de-baixo', 'De baixo para cima', 'This is taken from a low angle pointing slightly upward, a leg-lengthening blogger perspective. No mirror and no phone in frame; both hands are free.', 6),
  ('andando', 'Foto andando (candid)', 'A candid full-body shot of her walking, taken by someone else — natural stride, looking away or toward the camera, street-style blogger vibe. No mirror and no phone in frame; both hands are free.', 7),
  ('sentada', 'Sentada', 'A relaxed full-body shot of her seated (on a step, chair or couch), taken by someone else. No mirror and no phone in frame; both hands are free.', 8)
on conflict (id) do nothing;
