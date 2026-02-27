
CREATE OR REPLACE FUNCTION public.get_series_data(p_series_id integer)
RETURNS TABLE (
  series_id integer,
  league_id integer,
  division integer,
  group_number integer,
  division_level integer,
  league_name text,
  region_name text,
  season integer
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
    ls.division_level,
    cl.name AS league_name,
    lr.name AS region_name,
    cl.season
  FROM 
    league_series ls
  JOIN 
    country_leagues cl ON ls.league_id = cl.league_id
  JOIN 
    leagues_regions lr ON cl.region_id = lr.region_id
  WHERE 
    ls.series_id = p_series_id;
END;
$function$;
