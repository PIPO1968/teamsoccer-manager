
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";

export type TeamData = {
  team_id: number;
  name: string;
  club_logo: string | null;
  fan_count: number;
  stadium_name: string;
  stadium_capacity: number;
  team_spirit: string;
  manager_name: string;
  manager_id: string | null;
  manager_username: string | null;
  team_rating: number;
  team_morale: number;
  league?: {
    division: number;
    group_number: number;
  };
  goalsFor: number;
  goalsAgainst: number;
  won: number;
  played: number;
  points: number;
  form: string[];
  country: string;
  country_id?: number;
  is_bot: number;
  is_admin?: number; // Admin level
  is_premium?: number; // Premium status
};

export const useTeamData = (teamId: string | undefined) => {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(`Fetching team with team_id: ${teamId}`);

        const response = await apiFetch<{ success: boolean; team: any }>(`/teams/${teamId}`);
        const teamData = response.team;

        const enhancedTeamData: TeamData = {
          team_id: teamData.team_id || 0,
          name: teamData.name || "",
          club_logo: teamData.club_logo || null,
          fan_count: teamData.fan_count || 0,
          stadium_name: teamData.stadium_name || "Stadium",
          stadium_capacity: teamData.stadium_capacity || 15000,
          team_spirit: teamData.team_spirit || "",
          manager_name: teamData.manager_username || "Coach",
          manager_id: teamData.manager_id ? String(teamData.manager_id) : null,
          manager_username: teamData.manager_username || "Coach",
          team_rating: teamData.team_rating || 78,
          team_morale: teamData.team_morale || 75,
          goalsFor: 0,
          goalsAgainst: 0,
          won: 0,
          played: 0,
          points: 0,
          form: [],
          country: teamData.country_name || "England",
          country_id: teamData.country_id,
          is_bot: teamData.is_bot || 0,
          is_admin: teamData.manager_is_admin || 0,
          is_premium: teamData.manager_is_premium || 0,
        };

        setTeam(enhancedTeamData);
        console.log("Team data loaded successfully:", enhancedTeamData);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError(err instanceof Error ? err.message : "Error fetching team data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  return { team, isLoading, error };
};
