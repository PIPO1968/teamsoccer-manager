-- Tabla managers
CREATE TABLE IF NOT EXISTS managers (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text,
  country_id integer,
  is_admin integer DEFAULT 0,
  status text DEFAULT 'waiting_list',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla teams
CREATE TABLE IF NOT EXISTS teams (
  team_id serial PRIMARY KEY,
  name text NOT NULL,
  manager_username text,
  country integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla users (opcional, para info extra)
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text,
  username text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Tabla players
CREATE TABLE IF NOT EXISTS players (
  player_id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  position text NOT NULL,
  age integer NOT NULL,
  nationality_id integer REFERENCES teams(country),
  team_id integer REFERENCES teams(team_id),
  value integer,
  wage integer,
  rating integer,
  pace integer,
  finishing integer,
  passing integer,
  defense integer,
  dribbling integer,
  heading integer,
  stamina integer,
  fitness integer,
  form text,
  personality integer,
  experience integer,
  leadership integer,
  loyalty integer,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
