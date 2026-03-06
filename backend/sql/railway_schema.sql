-- Railway Postgres schema for TeamSoccer
-- Run this in Railway console or via psql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS managers (
  user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  country_id integer,
  is_admin integer DEFAULT 0,
  status text DEFAULT 'waiting_list',
  is_premium integer DEFAULT 0,
  premium_expires_at timestamptz,
  is_online boolean DEFAULT false,
  last_login timestamptz,
  last_seen timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leagues_regions (
  region_id serial PRIMARY KEY,
  name text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  team_id serial PRIMARY KEY,
  name text NOT NULL,
  manager_id integer REFERENCES managers(user_id) ON DELETE SET NULL,
  country_id integer REFERENCES leagues_regions(region_id),
  club_logo text,
  fan_count integer DEFAULT 0,
  team_rating integer DEFAULT 78,
  team_morale integer DEFAULT 75,
  team_spirit text DEFAULT 'Normal',
  is_bot integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stadiums (
  stadium_id serial PRIMARY KEY,
  name text NOT NULL,
  capacity integer DEFAULT 15000,
  team_id integer UNIQUE REFERENCES teams(team_id) ON DELETE CASCADE,
  build_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_finances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id integer UNIQUE REFERENCES teams(team_id) ON DELETE CASCADE,
  cash_balance integer DEFAULT 1000000,
  weekly_income integer DEFAULT 0,
  weekly_expenses integer DEFAULT 0,
  match_income integer DEFAULT 0,
  sponsor_income integer DEFAULT 0,
  player_sales_income integer DEFAULT 0,
  commission_income integer DEFAULT 0,
  other_income integer DEFAULT 0,
  wages_expenses integer DEFAULT 0,
  stadium_maintenance_expenses integer DEFAULT 0,
  stadium_building_expenses integer DEFAULT 0,
  staff_expenses integer DEFAULT 0,
  youth_expenses integer DEFAULT 0,
  new_signings_expenses integer DEFAULT 0,
  other_expenses integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  player_id serial PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  position text NOT NULL,
  age integer NOT NULL,
  nationality_id integer REFERENCES leagues_regions(region_id),
  team_id integer REFERENCES teams(team_id) ON DELETE SET NULL,
  value integer DEFAULT 0,
  wage integer DEFAULT 0,
  fitness integer DEFAULT 100,
  form text DEFAULT 'Good',
  contract_until text DEFAULT '2027',
  finishing integer DEFAULT 50,
  pace integer DEFAULT 50,
  passing integer DEFAULT 50,
  defense integer DEFAULT 50,
  dribbling integer DEFAULT 50,
  heading integer DEFAULT 50,
  stamina integer DEFAULT 50,
  goals integer DEFAULT 0,
  assists integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  minutes_played integer DEFAULT 0,
  rating integer DEFAULT 60,
  personality integer DEFAULT 50,
  experience integer DEFAULT 50,
  leadership integer DEFAULT 50,
  loyalty integer DEFAULT 50,
  owned_since timestamptz,
  avatar_seed text,
  avatar_hair_style integer,
  avatar_hair_color integer,
  avatar_skin_tone integer,
  avatar_eye_style integer,
  avatar_eye_color integer,
  avatar_mouth_style integer,
  avatar_eyebrows integer,
  avatar_shirt_color integer,
  avatar_background_color integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

-- Minimal seed for countries. England must be region_id = 2 for current frontend defaults.
INSERT INTO leagues_regions (region_id, name) VALUES
  (1, 'Spain'),
  (2, 'England'),
  (3, 'France')
ON CONFLICT (region_id) DO NOTHING;
