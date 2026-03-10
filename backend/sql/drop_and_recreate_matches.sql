-- Eliminar la tabla matches si existe
DROP TABLE IF EXISTS matches;

-- Crear la tabla matches vacía con la estructura original
CREATE TABLE IF NOT EXISTS matches (
  match_id_int serial PRIMARY KEY,
  home_team_id integer REFERENCES teams(team_id) ON DELETE CASCADE,
  away_team_id integer REFERENCES teams(team_id) ON DELETE CASCADE,
  home_score integer,
  away_score integer,
  match_date timestamptz NOT NULL,
  status text DEFAULT 'scheduled',
  is_friendly boolean DEFAULT false,
  series_id integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
