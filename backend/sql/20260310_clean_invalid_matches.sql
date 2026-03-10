-- 20260310_clean_invalid_matches.sql
-- Elimina partidos mal generados: equipos iguales, fechas inválidas o equipos nulos
DELETE FROM matches
WHERE home_team_id = away_team_id
   OR match_date IS NULL
   OR match_date = ''
   OR home_team_id IS NULL
   OR away_team_id IS NULL;
