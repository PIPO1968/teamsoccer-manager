
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useStadiumIdByTeamId = (teamId: number | undefined) => {
  const [stadiumId, setStadiumId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStadiumId = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("stadiums")
          .select("stadium_id")
          .eq("team_id", teamId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        if (data) {
          setStadiumId(data.stadium_id);
        }
        
      } catch (err) {
        console.error("Error fetching stadium ID:", err);
        setError(err instanceof Error ? err.message : "Error fetching stadium ID");
      } finally {
        setIsLoading(false);
      }
    };

    if (teamId) {
      fetchStadiumId();
    }
  }, [teamId]);

  return { stadiumId, isLoading, error };
};
