
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SeasonInfo = {
  current_season: number;
  current_week: number;
};

export const useCurrentSeason = () => {
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSeason = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('seasons')
          .select('current_season, current_week')
          .single();

        if (fetchError) throw fetchError;

        setSeasonInfo(data);
      } catch (err) {
        console.error("Error fetching season info:", err);
        setError(err instanceof Error ? err.message : "Error fetching season info");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSeason();
  }, []);

  return { seasonInfo, isLoading, error };
};
