
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

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

  const fetchFinances = async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ success: boolean; finances: TeamFinances }>(
        `/teams/${parseInt(teamId)}/finances`
      );
      setFinances(data.finances);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching finances:", err);
      setError(err instanceof Error ? err.message : "Error fetching financial data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, [teamId]);

  return { finances, isLoading, error, refetch: fetchFinances };
};
