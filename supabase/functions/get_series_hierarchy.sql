
CREATE OR REPLACE FUNCTION public.get_series_hierarchy(p_series_id integer)
RETURNS TABLE (
  type text,
  series_id integer,
  league_id integer,
  division integer,
  group_number integer,
  division_level integer,
  parent_series_id integer,
  season integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Current series
  RETURN QUERY
  SELECT 
    'current' AS type,
    ls.series_id,
    ls.league_id,
    ls.division,
    ls.group_number,
    ls.division_level,
    ls.parent_series_id,
    cl.season
  FROM 
    league_series ls
  JOIN
    country_leagues cl ON ls.league_id = cl.league_id
  WHERE 
    ls.series_id = p_series_id;
    
  -- Higher series (parent)
  RETURN QUERY
  SELECT 
    'higher' AS type,
    parent.series_id,
    parent.league_id,
    parent.division,
    parent.group_number,
    parent.division_level,
    parent.parent_series_id,
    cl.season
  FROM 
    league_series ls
  JOIN
    league_series parent ON ls.parent_series_id = parent.series_id
  JOIN
    country_leagues cl ON parent.league_id = cl.league_id
  WHERE 
    ls.series_id = p_series_id
    AND ls.parent_series_id IS NOT NULL;
    
  -- Lower series (child)
  RETURN QUERY
  SELECT 
    'lower' AS type,
    child.series_id,
    child.league_id,
    child.division,
    child.group_number,
    child.division_level,
    child.parent_series_id,
    cl.season
  FROM 
    league_series child
  JOIN
    country_leagues cl ON child.league_id = cl.league_id
  WHERE 
    child.parent_series_id = p_series_id
  ORDER BY
    child.group_number
  LIMIT 1;
END;
$function$;
