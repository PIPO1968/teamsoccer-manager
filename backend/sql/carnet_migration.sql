-- Carnet de Manager: license test definitions
CREATE TABLE IF NOT EXISTS manager_license_tests (
  id SERIAL PRIMARY KEY,
  test_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 50000,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Carnet de Manager: per-manager completion tracking
CREATE TABLE IF NOT EXISTS manager_license_progress (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER NOT NULL REFERENCES managers(user_id) ON DELETE CASCADE,
  test_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (manager_id, test_key)
);

-- Seed actualizado (visit_premium en lugar de visit_dashboard)
INSERT INTO manager_license_tests (test_key, title, description, reward_amount, sort_order) VALUES
('visit_premium',         'Premium Gratis',          'Visita la tienda y activa tus 30 días Premium gratis', 0,     1),
('visit_team',            'Conoce tu Equipo',        'Visita la página de tu equipo',                 50000, 2),
('visit_players',         'Gestiona tus Jugadores',  'Visita la lista de jugadores',                  50000, 3),
('visit_transfer_market', 'Mercado de Fichajes',     'Visita el Mercado de Transferencias',           75000, 4),
('visit_matches',         'Los Partidos',            'Visita la sección de Partidos',                 50000, 5),
('visit_finances',        'Las Finanzas',            'Revisa las finanzas de tu equipo',              50000, 6),
('visit_stadium',         'Tu Estadio',              'Visita tu estadio',                             50000, 7),
('visit_training',        'Entrenamiento',           'Visita la sección de Entrenamiento',            50000, 8),
('visit_forums',          'Los Foros',               'Visita los Foros de la comunidad',              50000, 9),
('visit_community',       'La Comunidad',            'Visita la página de Comunidad',                 50000, 10)
ON CONFLICT (test_key) DO NOTHING;

-- Eliminar visit_dashboard si existe (obsoleto)
DELETE FROM manager_license_tests WHERE test_key = 'visit_dashboard';
