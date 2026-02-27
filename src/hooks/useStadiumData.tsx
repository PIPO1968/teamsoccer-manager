
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StadiumData = {
  stadium_id: number;
  stadium_name: string;
  stadium_capacity: number;
  build_date: string;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  country?: string;
};

export const useStadiumData = (stadiumId: string | undefined) => {
  const [stadium, setStadium] = useState<StadiumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStadium = async () => {
      if (!stadiumId) {
        setIsLoading(false);
        return;
      }

      try {
        // Query stadiums table with join to teams and leagues_regions using stadium_id
        const { data, error: fetchError } = await supabase
          .from("stadiums")
          .select(`
            stadium_id,
            name,
            capacity,
            build_date,
            team_id,
            teams (
              name,
              club_logo,
              country_id,
              leagues_regions (
                name
              )
            )
          `)
          .eq("stadium_id", parseInt(stadiumId))
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        if (data) {
          // Format the data to match our StadiumData interface
          const stadiumData: StadiumData = {
            stadium_id: data.stadium_id,
            stadium_name: data.name,
            stadium_capacity: data.capacity,
            build_date: data.build_date,
            team_id: data.team_id,
            team_name: data.teams.name,
            team_logo: data.teams.club_logo,
            country: data.teams.leagues_regions?.name || undefined
          };
          
          setStadium(stadiumData);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching stadium:", err);
        setError(err instanceof Error ? err.message : "Error fetching stadium data");
        setIsLoading(false);
      }
    };

    fetchStadium();
  }, [stadiumId]);

  return { stadium, isLoading, error };
};
