-- Migración para solucionar errores de transferencias y jugadores
-- 1. Agregar columna nationality a players
ALTER TABLE players ADD COLUMN nationality text;

-- 2. (Opcional) Si necesitas team_id en transfer_listings, descomenta la siguiente línea:
-- ALTER TABLE transfer_listings ADD COLUMN team_id integer REFERENCES teams(team_id);
