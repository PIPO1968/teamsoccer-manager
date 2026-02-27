
CREATE OR REPLACE FUNCTION public.get_league_standings(p_series_id integer)
RETURNS TABLE(
  team_id integer, 
  team_name text, 
  team_primary_color text, 
  team_logo text, 
  played integer, 
  won integer, 
  drawn integer, 
  lost integer, 
  goals_for integer, 
  goals_against integer, 
  goal_difference integer, 
  points integer, 
  form text[],
  is_bot integer
) 
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.team_id,
    t.name AS team_name,
    t.primary_color AS team_primary_color,
    t.club_logo AS team_logo,
    s.played,
    s.won,
    s.drawn,
    s.lost,
    s.goals_for,
    s.goals_against,
    (s.goals_for - s.goals_against) AS goal_difference,
    s.points,
    s.form,
    t.is_bot
  FROM 
    team_league_stats s
  JOIN
    teams t ON s.team_id = t.team_id
  WHERE 
    s.series_id = p_series_id
  ORDER BY
    s.points DESC,
    (s.goals_for - s.goals_against) DESC,
    s.goals_for DESC,
    t.name ASC;
END;
$function$;
