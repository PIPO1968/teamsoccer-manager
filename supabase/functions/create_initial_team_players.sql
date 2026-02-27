-- Crea 18 jugadores para un equipo dado, con media técnica total ≈ 280 y media física total ≈ 10
-- Llama a esta función tras crear el equipo, pasando el team_id
CREATE OR REPLACE FUNCTION public.create_initial_team_players(p_team_id integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_positions text[] := ARRAY['GK','RB','CB','CB','LB','RM','CM','CM','LM','RW','CAM','CDM','LW','ST','ST','CF','CB','RB'];
  v_first_names text[] := ARRAY['Alex','Brian','Carlos','David','Eric','Frank','George','Henry','Ivan','Jack','Kevin','Luis','Mario','Nico','Oscar','Paul','Quinn','Rafa'];
  v_last_names text[] := ARRAY['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Garcia','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Martin'];
  v_i integer;
  v_tech_total integer;
  v_phy_total integer;
  v_finishing integer;
  v_speed integer;
  v_pace integer;
  v_passing integer;
  v_defense integer;
  v_dribbling integer;
  v_heading integer;
  v_crossing integer;
  v_shooting integer;
  v_stamina integer;
  v_pace integer;
BEGIN
  FOR v_i IN 1..18 LOOP
    -- Técnicas: 8 habilidades, suma 280, reparto aleatorio
    v_finishing := 10 + floor(random()*71); -- 10-80
    v_pace := 10 + floor(random()*71);
    v_passing := 10 + floor(random()*71);
    v_defense := 10 + floor(random()*71);
    v_dribbling := 10 + floor(random()*71);
    v_heading := 10 + floor(random()*71);
    v_crossing := 10 + floor(random()*71);
    v_shooting := 10 + floor(random()*71);
    v_tech_total := v_finishing + v_pace + v_passing + v_defense + v_dribbling + v_heading + v_crossing + v_shooting;
    -- Ajusta la última skill para que la suma sea exactamente 280
    v_shooting := v_shooting + (280 - v_tech_total);
    IF v_shooting < 10 THEN v_shooting := 10; END IF;
    IF v_shooting > 80 THEN v_shooting := 80; END IF;
    -- Físicas: stamina y speed, suma 10, reparto aleatorio
    v_stamina := 1 + floor(random()*9); -- 1-9
    v_speed := 10 - v_stamina; -- el resto hasta 10
    v_phy_total := v_stamina + v_speed;
    -- Inserta el jugador
    INSERT INTO players (
      first_name, last_name, position, team_id, finishing, pace, passing, defense, dribbling, heading, crossing, shooting, stamina, speed, age, value, wage, rating, form, fitness, nationality_id
    ) VALUES (
      v_first_names[v_i], v_last_names[v_i], v_positions[v_i], p_team_id,
      v_finishing, v_pace, v_passing, v_defense, v_dribbling, v_heading, v_crossing, v_shooting, v_stamina, v_speed,
      18 + floor(random()*7), -- edad 18-24
      1000000 + floor(random()*500000), -- valor
      1000 + floor(random()*500), -- salario
      60 + floor(random()*20), -- rating
      'Good',
      80 + floor(random()*20), -- fitness
      1 -- nacionalidad temporal
    );
  END LOOP;
END;
$$;