-- Separa a "foto da modelo" em duas referências independentes — rosto e
-- corpo — para máxima consistência de identidade/proporções entre gerações.

create type public.model_photo_kind as enum ('rosto', 'corpo');

alter table public.model_photos
  add column kind public.model_photo_kind not null default 'corpo';

alter table public.model_photos
  drop column is_default;

create index model_photos_user_kind_idx on public.model_photos(user_id, kind);

-- looks: troca a FK única `model_photo_id` por duas FKs obrigatórias.
alter table public.looks
  add column model_face_photo_id uuid references public.model_photos(id) on delete restrict,
  add column model_body_photo_id uuid references public.model_photos(id) on delete restrict;

update public.looks
  set model_face_photo_id = coalesce(model_face_photo_id, model_photo_id),
      model_body_photo_id = coalesce(model_body_photo_id, model_photo_id)
  where model_photo_id is not null;

alter table public.looks
  alter column model_face_photo_id set not null,
  alter column model_body_photo_id set not null;

alter table public.looks
  drop column model_photo_id;

-- preferences: mesmo padrão, um padrão para rosto e outro para corpo.
alter table public.preferences
  add column default_model_face_photo_id uuid references public.model_photos(id) on delete set null,
  add column default_model_body_photo_id uuid references public.model_photos(id) on delete set null;

update public.preferences
  set default_model_face_photo_id = coalesce(default_model_face_photo_id, default_model_photo_id),
      default_model_body_photo_id = coalesce(default_model_body_photo_id, default_model_photo_id)
  where default_model_photo_id is not null;

alter table public.preferences
  drop column default_model_photo_id;
