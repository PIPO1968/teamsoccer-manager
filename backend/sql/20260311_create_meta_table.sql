-- Crea la tabla meta si no existe
CREATE TABLE IF NOT EXISTS meta (
    id SERIAL PRIMARY KEY,
    current_season INTEGER NOT NULL DEFAULT 1
);

-- Inserta un registro por defecto si la tabla está vacía
INSERT INTO meta (current_season)
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM meta);
