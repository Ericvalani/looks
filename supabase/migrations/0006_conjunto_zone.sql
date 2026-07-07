-- Adiciona a zona "conjunto": uma única foto que já mostra parte de cima e
-- parte de baixo juntas (ex: um vestido, ou um conjunto combinando),
-- usada como alternativa a preencher topo/inferior separadamente.

alter type public.garment_zone add value 'conjunto';
