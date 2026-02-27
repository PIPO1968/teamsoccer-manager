
CREATE OR REPLACE FUNCTION public.get_team_league_data(p_team_id integer)
RETURNS TABLE (
  series_id integer,
  league_id integer,
  division integer,
  group_number integer,
  region_name text,
  league_name text
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ls.series_id,
    ls.league_id,
    ls.division,
    ls.group_number,
    lr.name AS region_name,
    cl.name AS league_name
  FROM 
    league_members lm
  JOIN
    league_series ls ON lm.series_id = ls.series_id
  JOIN
    country_leagues cl ON ls.league_id = cl.league_id
  JOIN
    leagues_regions lr ON cl.region_id = lr.region_id
  WHERE 
    lm.team_id = p_team_id;
END;
$function$;
