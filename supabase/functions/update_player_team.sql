
CREATE OR REPLACE FUNCTION update_player_team(p_player_id INT, p_new_team_id INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE players
  SET 
    team_id = p_new_team_id,
    owned_since = NOW()
  WHERE player_id = p_player_id;
END;
$$;
