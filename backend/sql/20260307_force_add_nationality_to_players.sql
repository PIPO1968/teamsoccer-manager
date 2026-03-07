-- Migración directa para añadir columna nationality a players si no existe
ALTER TABLE players ADD COLUMN IF NOT EXISTS nationality text;