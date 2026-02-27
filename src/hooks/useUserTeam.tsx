
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TeamData } from "./useTeamData";
import { useAuth } from "@/contexts/AuthContext";

// Define explicit types for the RPC function results
type TeamStatsResponse = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
};

type TeamFormResponse = string[];

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
    const fetchTeam = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .eq("manager_id", manager.user_id)
          .maybeSingle();
        if (error) {
          setError(error.message);
          setTeam(null);
        } else {
          setTeam(data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching team");
        setTeam(null);
      }
      setIsLoading(false);
    };
    fetchTeam();
  }, [manager]);

  const fetchUserTeam = useCallback(async () => {
    if (!manager) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching team for manager:", manager.user_id);

      // 1. Fetch basic team data directly from teams table
      let { data, error } = await supabase
        .from("teams")
        .select(`
          team_id,
          name,
          club_logo,
          fan_count,
          team_spirit,
          manager_id,
          team_rating,
          team_morale,
          country_id,
          is_bot
        `)
        .eq("manager_id", manager.user_id)
        .maybeSingle();

      if (!data && !error) {
        console.log("No team found for manager via manager_id, trying team_id 1");
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("teams")
          .select(`
            team_id,
            name,
            club_logo,
            fan_count,
            team_spirit,
            manager_id,
            team_rating,
            team_morale,
            country_id,
            is_bot
          `)
          .eq("team_id", 1)
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        data = fallbackData;
      } else if (error) {
        throw error;
      }

      if (data) {
        console.log("Team data found:", data);

        const teamId = data.team_id;

        // 2. Fetch stadium data
        const { data: stadiumData, error: stadiumError } = await supabase
          .from("stadiums")
          .select(`
            name,
            capacity
          `)
          .eq("team_id", teamId)
          .maybeSingle();

        if (stadiumError) {
          console.error("Error fetching stadium data:", stadiumError);
        }

        const { data: seriesData } = await supabase
          .from("series_members")
          .select(`
            series_id,
            series!inner (
              division,
              group_number
            )
          `)
          .eq("team_id", teamId)
          .maybeSingle();

        let statsData: TeamStatsResponse = {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0
        };

        let formData: string[] = [];

        let manager_username = null;
        let countryName = 'England'; // Default country

        if (data.manager_id) {
          const { data: managerData } = await supabase
            .from("managers")
            .select("username")
            .eq("user_id", data.manager_id)
            .maybeSingle();

          if (managerData) {
            manager_username = managerData.username;
          }
        }

        // Get country name from country_id
        if (data.country_id) {
          const { data: countryData } = await supabase
            .from("leagues_regions")
            .select("name")
            .eq("region_id", data.country_id)
            .maybeSingle();

          if (countryData) {
            countryName = countryData.name;
          }
        }

        const enhancedTeamData: TeamData = {
          team_id: data.team_id || 0,
          name: data.name || '',
          club_logo: data.club_logo,
          fan_count: data.fan_count || 0,
          stadium_name: stadiumData?.name || 'Stadium',
          stadium_capacity: stadiumData?.capacity || 15000,
          team_spirit: data.team_spirit || '',
          manager_name: manager_username || 'Coach',
          manager_id: data.manager_id?.toString() || null,
          manager_username: manager_username || 'Coach',
          team_rating: data.team_rating || 78,
          team_morale: data.team_morale || 75,
          league: seriesData ? {
            division: seriesData.series.division,
            group_number: seriesData.series.group_number
          } : undefined,
          goalsFor: statsData.goals_for,
          goalsAgainst: statsData.goals_against,
          won: statsData.won,
          played: statsData.played,
          points: statsData.points,
          form: formData,
          country: countryName,
          country_id: data.country_id,
          is_bot: data.is_bot || 0
        };

        setTeam(enhancedTeamData);
        setError(null);
      } else {
        // If no team found, this manager is truly on waiting list
        setTeam(null);
      }
    } catch (err) {
      console.error("Error fetching user team:", err);
      setError(err instanceof Error ? err.message : "Error fetching team data");
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  useEffect(() => {
    fetchUserTeam();
  }, [fetchUserTeam]);

  return { team, isLoading, error, refetch: fetchUserTeam };
};
