
import { useState, useEffect, useCallback } from "react";
import type { TeamData } from "./useTeamData";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/services/apiClient";

export const useUserTeam = () => {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { manager } = useAuth();

  useEffect(() => {
    if (!manager) {
      setIsLoading(false);
      setTeam(null);
      return;
    }
    fetchUserTeam();
  }, [manager]);

  const fetchUserTeam = useCallback(async () => {
    if (!manager) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Eliminado log de depuración

      const response = await apiFetch<{ success: boolean; team: any | null }>(
        `/teams/by-manager/${manager.user_id}`
      );

      if (!response.team) {
        setTeam(null);
        setError(null);
        return;
      }

      const data = response.team;
      const enhancedTeamData: TeamData = {
        team_id: data.team_id || 0,
        name: data.name || "",
        club_logo: data.club_logo || null,
        fan_count: data.fan_count || 0,
        stadium_name: data.stadium_name || "Stadium",
        stadium_capacity: data.stadium_capacity || 15000,
        team_spirit: data.team_spirit || "",
        manager_name: data.manager_username || "Coach",
        manager_id: data.manager_id ? String(data.manager_id) : null,
        manager_username: data.manager_username || "Coach",
        team_rating: data.team_rating || 78,
        team_morale: data.team_morale || 75,
        goalsFor: 0,
        goalsAgainst: 0,
        won: 0,
        played: 0,
        points: 0,
        form: [],
        country: data.country_name || "England",
        country_id: data.country_id,
        is_bot: data.is_bot || 0,
        is_admin: data.manager_is_admin || 0,
        is_premium: data.manager_is_premium || 0,
      };

      setTeam(enhancedTeamData);
      setError(null);
    } catch (err) {
      // Eliminado log de depuración
      setError(err instanceof Error ? err.message : "Error fetching team data");
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  useEffect(() => {
    fetchUserTeam();
  }, [fetchUserTeam]);

  return { team, isLoading, error, refetch: fetchUserTeam };
};
