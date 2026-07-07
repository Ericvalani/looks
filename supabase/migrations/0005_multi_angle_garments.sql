-- Permite anexar mais de uma foto (ângulos diferentes) da mesma peça em um
-- único look, para o gpt-image-2 reconstruir a peça com mais precisão.
-- `garment_photos` continua igual (uma linha por foto, por zona); o que
-- muda é que `look_garments` deixa de limitar a 1 foto por zona por look.

alter table public.look_garments
  drop constraint if exists look_garments_look_id_zone_key;
