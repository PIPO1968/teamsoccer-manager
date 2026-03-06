
CREATE OR REPLACE FUNCTION public.create_new_manager(
  p_username text,
  p_email text,
  p_password text,
  p_country text DEFAULT 'England'::text,
  p_team_name text DEFAULT NULL::text,
  p_agreed_to_terms boolean DEFAULT false
)
RETURNS TABLE(user_id integer, team_id integer, series_id integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id INTEGER;
  v_team_id INTEGER;
  v_country_id INTEGER;
BEGIN
  -- Log the start of the function execution
  RAISE NOTICE 'Starting create_new_manager execution with username: %, email: %, country: %, team_name: %', 
    p_username, p_email, p_country, p_team_name;
    
  -- Validate inputs
  IF NOT p_agreed_to_terms THEN
    RAISE EXCEPTION 'You must agree to the terms of service';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM managers WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;

  -- Check if username already exists
  IF EXISTS (SELECT 1 FROM managers WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- Get country_id from country name
  SELECT region_id INTO v_country_id 
  FROM leagues_regions 
  WHERE name = p_country;
  
  IF v_country_id IS NULL THEN
    RAISE EXCEPTION 'Invalid country: %', p_country;
  END IF;

  -- Insert new manager with waiting_list status (no team assignment)
  INSERT INTO managers (username, email, password, country_id, status)
  VALUES (
    p_username, 
    p_email, 
    crypt(p_password, gen_salt('bf')), -- Hash the password using Blowfish
    v_country_id,
    'waiting_list'
  )
  RETURNING managers.user_id INTO v_user_id;
  
  RAISE NOTICE 'Manager created with ID: % in waiting_list status', v_user_id;

  -- Create a team for the manager if team name is provided
  IF p_team_name IS NOT NULL THEN
    RAISE NOTICE 'Creating team named: %', p_team_name;
    
    -- Create user's team
    INSERT INTO teams (name, manager_id, country_id, is_bot)
    VALUES (p_team_name, v_user_id, v_country_id, 0)
    RETURNING teams.team_id INTO v_team_id;
    
    RAISE NOTICE 'Created team with ID: %', v_team_id;

    -- Create team finances
    INSERT INTO team_finances (team_id, cash_balance)
    VALUES (v_team_id, 1000000);
    
    -- Create a stadium for the team
    INSERT INTO stadiums (name, team_id)
    VALUES (p_team_name || ' Stadium', v_team_id);
    
    -- Crear jugadores iniciales automáticamente
    PERFORM public.create_initial_team_players(v_team_id);
    
    RAISE NOTICE 'Created team facilities and players for team: %', v_team_id;
  END IF;

  RAISE NOTICE 'create_new_manager completed successfully: user_id: %, team_id: %, series_id: NULL', 
    v_user_id, COALESCE(v_team_id, 0);

  -- Return the created IDs (series_id is NULL since no league assignment)
  RETURN QUERY
  SELECT v_user_id, COALESCE(v_team_id, 0), NULL::integer;
END;
$$;
