
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SeriesInfo = {
  series_id: number;
  league_id: number;
  division: number;
  group_number: number;
  season: number;
  parent_series_id: number | null;
  division_level: number;
};

export const useLeagueHierarchy = (currentSeriesId: string | undefined) => {
  const [currentSeries, setCurrentSeries] = useState<SeriesInfo | null>(null);
  const [higherSeries, setHigherSeries] = useState<SeriesInfo | null>(null);
  const [lowerSeries, setLowerSeries] = useState<SeriesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!currentSeriesId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const parsedSeriesId = parseInt(currentSeriesId);
        
        // 1. Fetch current series data
        const { data: currentData, error: currentError } = await supabase
          .from('series')
          .select(`
            series_id,
            league_id,
            division,
            group_number,
            division_level,
            parent_series_id,
            season,
            league:leagues!inner (
              region:leagues_regions!inner (
                name
              )
            )
          `)
          .eq('series_id', parsedSeriesId)
          .single();
          
        if (currentError) throw currentError;
        if (!currentData) throw new Error("Series not found");
        
        // Set current series data
        setCurrentSeries({
          series_id: currentData.series_id,
          league_id: currentData.league_id,
          division: currentData.division,
          group_number: currentData.group_number,
          division_level: currentData.division_level,
          parent_series_id: currentData.parent_series_id,
          season: currentData.season
        });
        
        // 2. If there's a parent, fetch the higher series
        if (currentData.parent_series_id) {
          const { data: parentData, error: parentError } = await supabase
            .from('series')
            .select(`
              series_id, 
              league_id,
              division,
              group_number,
              division_level,
              parent_series_id,
              season
            `)
            .eq('series_id', currentData.parent_series_id)
            .single();
            
          if (!parentError && parentData) {
            setHigherSeries({
              series_id: parentData.series_id,
              league_id: parentData.league_id,
              division: parentData.division,
              group_number: parentData.group_number,
              division_level: parentData.division_level,
              parent_series_id: parentData.parent_series_id,
              season: parentData.season
            });
          } else {
            setHigherSeries(null);
          }
        } else {
          setHigherSeries(null);
        }
        
        // 3. Fetch lower series (children)
        const { data: lowerData, error: lowerError } = await supabase
          .from('series')
          .select(`
            series_id, 
            league_id,
            division,
            group_number,
            division_level,
            parent_series_id,
            season
          `)
          .eq('parent_series_id', parsedSeriesId)
          .order('group_number')
          .limit(1);
          
        if (!lowerError && lowerData && lowerData.length > 0) {
          setLowerSeries({
            series_id: lowerData[0].series_id,
            league_id: lowerData[0].league_id,
            division: lowerData[0].division,
            group_number: lowerData[0].group_number,
            division_level: lowerData[0].division_level,
            parent_series_id: lowerData[0].parent_series_id,
            season: lowerData[0].season
          });
        } else {
          setLowerSeries(null);
        }
        
        setIsLoading(false);

      } catch (err) {
        console.error("Error fetching series:", err);
        setError(err instanceof Error ? err.message : "Error fetching series data");
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [currentSeriesId]);

  return { currentSeries, higherSeries, lowerSeries, isLoading, error };
};
