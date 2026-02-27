
import { useState, useEffect } from "react";
import { useUserTeam } from "./useUserTeam";
import { format, isToday, isTomorrow, addDays, parseISO } from "date-fns";
import { useTeamLeague } from "./useTeamLeague";
import { apiFetch } from "@/services/apiClient";

export type MatchResult = {
  opponent: string;
  result: "Win" | "Draw" | "Loss";
  score: string;
  date: string;
  isHome: boolean;
};

export type NextMatch = {
  id: number;
  opponent: string;
  date: Date;
  isHome: boolean;
};

export const useDashboardData = () => {
  const { team } = useUserTeam();
  const [recentMatches, setRecentMatches] = useState<MatchResult[]>([]);
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [leaguePosition, setLeaguePosition] = useState<{ position: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { league } = useTeamLeague(team?.team_id?.toString());

  // Solo lógica real: nada de demo

  // Fetch recent matches and next match
  useEffect(() => {
    const fetchMatches = async () => {
      if (!team?.team_id) return;

      try {
        const recentResponse = await apiFetch<{ success: boolean; matches: any[] }>(
          `/matches/recent?teamId=${team.team_id}`
        );

        const processedMatches = recentResponse.matches.map(match => {
          const isHome = match.home_team_id === team.team_id;
          const userScore = isHome ? match.home_score : match.away_score;
          const opponentScore = isHome ? match.away_score : match.home_score;
          const opponentName = isHome ? match.away_name : match.home_name;

          let result: "Win" | "Draw" | "Loss" = "Draw";
          if (userScore > opponentScore) result = "Win";
          else if (userScore < opponentScore) result = "Loss";

          return {
            opponent: opponentName,
            result,
            score: `${userScore}-${opponentScore}`,
            date: format(parseISO(match.match_date), "MMM d"),
            isHome
          };
        });

        setRecentMatches(processedMatches);

        const nextResponse = await apiFetch<{ success: boolean; match: any | null }>(
          `/matches/next?teamId=${team.team_id}`
        );

        if (nextResponse.match) {
          const match = nextResponse.match;
          const isHome = match.home_team_id === team.team_id;
          const opponentName = isHome ? match.away_name : match.home_name;

          setNextMatch({
            id: match.match_id_int,
            opponent: opponentName,
            date: parseISO(match.match_date),
            isHome
          });
        } else {
          setNextMatch(null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "Error fetching dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (team?.team_id) {
      fetchMatches();
    } else {
      setIsLoading(false);
    }
  }, [team?.team_id]);

  // Format date for next match display
  const getFormattedMatchDate = (date: Date | null) => {
    if (!date) return "";

    if (isToday(date)) {
      return `Today, ${format(date, "HH:mm")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, "HH:mm")}`;
    } else if (date < addDays(new Date(), 7)) {
      return `${format(date, "EEEE")}, ${format(date, "HH:mm")}`;
    } else {
      return format(date, "MMM d, HH:mm");
    }
  };

  return {
    team,
    league,
    recentMatches,
    nextMatch,
    leaguePosition,
    getFormattedMatchDate,
    isLoading,
    error
  };
};
