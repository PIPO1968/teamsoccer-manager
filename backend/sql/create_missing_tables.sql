-- Tabla para seguidores de equipos
CREATE TABLE IF NOT EXISTS team_followers (
  id serial PRIMARY KEY,
  team_id integer REFERENCES teams(team_id) ON DELETE CASCADE,
  manager_id integer REFERENCES managers(user_id) ON DELETE CASCADE,
  followed_at timestamptz DEFAULT now(),
  UNIQUE(team_id, manager_id)
);

-- Tabla para libro de visitas de equipos
CREATE TABLE IF NOT EXISTS team_guestbook (
  id serial PRIMARY KEY,
  team_id integer REFERENCES teams(team_id) ON DELETE CASCADE,
  manager_id integer REFERENCES managers(user_id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla para asignaciones de entrenamiento de jugadores
CREATE TABLE IF NOT EXISTS player_training_assignments (
  id serial PRIMARY KEY,
  player_id integer REFERENCES players(player_id) ON DELETE CASCADE,
  training_type text NOT NULL,
  assigned_at timestamptz DEFAULT now()
);

-- Tabla para desafíos de equipos
CREATE TABLE IF NOT EXISTS team_challenges (
  id serial PRIMARY KEY,
  team_id integer REFERENCES teams(team_id) ON DELETE CASCADE,
  challenge_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'
);
