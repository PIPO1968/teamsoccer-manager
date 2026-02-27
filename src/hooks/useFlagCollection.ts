
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { fetchAllCountries } from "@/utils/countries";

export type CountryInfo = {
  region_id: number;
  name: string;
};

export const useFlagCollection = (teamId: string | undefined) => {
  const [allCountries, setAllCountries] = useState<CountryInfo[]>([]);
  const [opponentCountries, setOpponentCountries] = useState<CountryInfo[]>([]);
  const [followerCountries, setFollowerCountries] = useState<CountryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { players } = useTeamPlayers(teamId);

  // Get unique countries from players using nationality_id
  const playerCountries = players
    ? Array.from(
        new Map(
          players
            .filter(player => player.nationality_id)
            .map(player => [
              player.nationality_id, 
              { 
                region_id: player.nationality_id as number, 
                name: player.nationality || 'Unknown'
              }
            ])
        ).values()
      )
    : [];

  useEffect(() => {
    // Fetch all countries
    const loadAllCountries = async () => {
      const countries = await fetchAllCountries();
      setAllCountries(countries);
    };

    loadAllCountries();
  }, []);

  useEffect(() => {
    const fetchFlagCollections = async () => {
      if (!teamId) return;

      setIsLoading(true);

      try {
        // Fetch countries of teams played against
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            home_team_id, 
            away_team_id,
            home_team:teams!home_team_id(country_id),
            away_team:teams!away_team_id(country_id)
          `)
          .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
          .not('status', 'eq', 'scheduled');

        if (matchError) throw matchError;

        // Extract opponent countries - we need to get country names from country_ids
        const opponentCountryIds = new Set<number>();

        matchData.forEach(match => {
          if (match.home_team_id.toString() === teamId) {
            // Away team is the opponent
            const countryId = match.away_team?.country_id;
            if (countryId) {
              opponentCountryIds.add(countryId);
            }
          } else {
            // Home team is the opponent
            const countryId = match.home_team?.country_id;
            if (countryId) {
              opponentCountryIds.add(countryId);
            }
          }
        });

        // Get country names from the leagues_regions table
        const { data: opponentCountryNames, error: opponentCountryError } = await supabase
          .from("leagues_regions")
          .select("region_id, name")
          .in("region_id", Array.from(opponentCountryIds));

        if (opponentCountryError) throw opponentCountryError;

        const opponents = opponentCountryNames.map(country => ({
          region_id: country.region_id,
          name: country.name
        }));

        // Fetch countries of followers
        const { data: followerData, error: followerError } = await supabase
          .from("team_followers")
          .select(`
            follower_id, 
            managers:managers!follower_id(country_id)
          `)
          .eq('team_id', parseInt(teamId));

        if (followerError) throw followerError;

        // Extract follower countries
        const followerCountryIds = new Set<number>();

        followerData.forEach(follower => {
          const countryId = follower.managers?.country_id;
          if (countryId) {
            followerCountryIds.add(countryId);
          }
        });

        // Get country names for followers
        const { data: followerCountryNames, error: followerCountryError } = await supabase
          .from("leagues_regions")
          .select("region_id, name")
          .in("region_id", Array.from(followerCountryIds));

        if (followerCountryError) throw followerCountryError;

        const followers = followerCountryNames.map(country => ({
          region_id: country.region_id,
          name: country.name
        }));

        setOpponentCountries(opponents);
        setFollowerCountries(followers);
      } catch (error) {
        console.error("Error fetching flag collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlagCollections();
  }, [teamId]);

  return {
    allCountries,
    opponentCountries,
    playerCountries,
    followerCountries,
    isLoading
  };
};
