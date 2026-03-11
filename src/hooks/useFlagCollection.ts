
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClient";
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
        const data = await apiFetch<{
          success: boolean;
          opponentCountries: CountryInfo[];
          followerCountries: CountryInfo[];
        }>(`/teams/${parseInt(teamId)}/flag-collection`);
        setOpponentCountries(data.opponentCountries || []);
        setFollowerCountries(data.followerCountries || []);
      } catch (error) {
        console.error("Error fetching flag collections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlagCollections();
  }, [teamId]);

  return { allCountries, opponentCountries, playerCountries, followerCountries, isLoading };
};
