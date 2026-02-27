-- Migración de tablas adicionales para TeamSoccer Manager

CREATE TABLE IF NOT EXISTS forum_categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forums (
  id serial PRIMARY KEY,
  category_id integer REFERENCES forum_categories(id),
  name text NOT NULL,
  description text,
  order_number integer DEFAULT 0,
  thread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id serial PRIMARY KEY,
  forum_id integer REFERENCES forums(id),
  user_id integer REFERENCES managers(user_id),
  title text NOT NULL,
  is_sticky boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  last_post_id integer,
  last_post_at timestamptz,
  last_post_user_id integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id serial PRIMARY KEY,
  thread_id integer REFERENCES forum_threads(id),
  user_id integer REFERENCES managers(user_id),
  content text NOT NULL,
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_news (
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  author_id integer REFERENCES managers(user_id),
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_listings (
  id serial PRIMARY KEY,
  player_id integer REFERENCES players(player_id),
  seller_team_id integer REFERENCES teams(team_id),
  asking_price integer NOT NULL,
  is_active boolean DEFAULT true,
  views integer DEFAULT 0,
  bids integer DEFAULT 0,
  hotlists integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_bids (
  id serial PRIMARY KEY,
  transfer_listing_id integer REFERENCES transfer_listings(id),
  bidder_team_id integer REFERENCES teams(team_id),
  bid_amount integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
