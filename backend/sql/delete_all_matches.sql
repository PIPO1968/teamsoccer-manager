-- Eliminar todos los partidos de todos los clubes
DELETE FROM matches;

-- (Opcional) Reiniciar el contador de IDs si usas serial/identity
-- ALTER SEQUENCE matches_match_id_int_seq RESTART WITH 1;