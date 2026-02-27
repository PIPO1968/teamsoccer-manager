
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TeamFinances = {
  id: string;
  team_id: number;
  cash_balance: number;
  weekly_income: number;
  weekly_expenses: number;
  match_income: number;
  sponsor_income: number;
  player_sales_income: number;
  commission_income: number;
  other_income: number;
  wages_expenses: number;
  stadium_maintenance_expenses: number;
  stadium_building_expenses: number;
  staff_expenses: number;
  youth_expenses: number;
  new_signings_expenses: number;
  other_expenses: number;
};

export const useTeamFinances = (teamId: string | undefined) => {
  const [finances, setFinances] = useState<TeamFinances | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinances = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("team_finances")
          .select("*")
          .eq("team_id", parseInt(teamId))
          .maybeSingle();

        if (fetchError) throw fetchError;
        
        setFinances(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching finances:", err);
        setError(err instanceof Error ? err.message : "Error fetching financial data");
        setIsLoading(false);
      }
    };

    fetchFinances();
  }, [teamId]);

  return { finances, isLoading, error };
};
