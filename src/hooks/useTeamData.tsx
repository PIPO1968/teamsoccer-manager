
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        
        const { data: teamData, error: teamError } = await supabase
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
          .eq("team_id", parseInt(teamId))
          .maybeSingle();

        if (teamError) {
          throw teamError;
        }

        const { data: stadiumData, error: stadiumError } = await supabase
          .from("stadiums")
          .select(`
            name,
            capacity
          `)
          .eq("team_id", parseInt(teamId))
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
          .eq("team_id", parseInt(teamId))
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
        let manager_is_admin = 0;
        let manager_is_premium = 0;
        let countryName = 'England'; // Default country

        if (teamData.manager_id) {
          const { data: managerData } = await supabase
            .from("managers")
            .select("username, is_admin, is_premium")
            .eq("user_id", teamData.manager_id)
            .maybeSingle();
            
          if (managerData) {
            manager_username = managerData.username;
            manager_is_admin = managerData.is_admin || 0;
            manager_is_premium = managerData.is_premium || 0;
          }
        }

        // Get country name from country_id
        if (teamData.country_id) {
          const { data: countryData } = await supabase
            .from("leagues_regions")
            .select("name")
            .eq("region_id", teamData.country_id)
            .maybeSingle();
            
          if (countryData) {
            countryName = countryData.name;
          }
        }

        const enhancedTeamData: TeamData = {
          team_id: teamData.team_id || 0,
          name: teamData.name || '',
          club_logo: teamData.club_logo,
          fan_count: teamData.fan_count || 0,
          stadium_name: stadiumData?.name || 'Stadium',
          stadium_capacity: stadiumData?.capacity || 15000,
          team_spirit: teamData.team_spirit || '',
          manager_name: manager_username || 'Coach',
          manager_id: teamData.manager_id?.toString() || null,
          manager_username: manager_username || 'Coach',
          team_rating: teamData.team_rating || 78,
          team_morale: teamData.team_morale || 75,
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
          country_id: teamData.country_id,
          is_bot: teamData.is_bot || 0,
          is_admin: manager_is_admin,
          is_premium: manager_is_premium
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
