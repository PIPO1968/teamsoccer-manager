-- Crea la tabla meta si no existe y agrega un registro por defecto si está vacía
CREATE TABLE IF NOT EXISTS meta (
    id SERIAL PRIMARY KEY,
    current_season INTEGER NOT NULL DEFAULT 1
);

INSERT INTO meta (current_season)
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM meta);
