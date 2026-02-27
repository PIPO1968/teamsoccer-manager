
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserTeam } from "./useUserTeam";
import { format, isToday, isTomorrow, addDays, parseISO } from "date-fns";
import { useTeamLeague } from "./useTeamLeague";

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
        // Fetch completed matches (recent matches)
        const { data: completedMatches, error: completedError } = await supabase
          .from("matches")
          .select(`
            match_id_int,
            match_date,
            home_team_id,
            away_team_id,
            home_score,
            away_score,
            home:teams!matches_home_team_id_fkey(name),
            away:teams!matches_away_team_id_fkey(name)
          `)
          .or(`home_team_id.eq.${team.team_id},away_team_id.eq.${team.team_id}`)
          .eq("status", "completed")
          .order("match_date", { ascending: false })
          .limit(5);

        if (completedError) throw completedError;

        // Process completed matches
        const processedMatches = completedMatches.map(match => {
          const isHome = match.home_team_id === team.team_id;
          const userScore = isHome ? match.home_score : match.away_score;
          const opponentScore = isHome ? match.away_score : match.home_score;
          const opponentName = isHome ? match.away.name : match.home.name;

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

        // Fetch upcoming match (next match)
        const { data: upcomingMatches, error: upcomingError } = await supabase
          .from("matches")
          .select(`
            match_id_int,
            match_date,
            home_team_id,
            away_team_id,
            home:teams!matches_home_team_id_fkey(name),
            away:teams!matches_away_team_id_fkey(name)
          `)
          .or(`home_team_id.eq.${team.team_id},away_team_id.eq.${team.team_id}`)
          .eq("status", "scheduled")
          .order("match_date", { ascending: true })
          .limit(1);

        if (upcomingError) throw upcomingError;

        if (upcomingMatches && upcomingMatches.length > 0) {
          const match = upcomingMatches[0];
          const isHome = match.home_team_id === team.team_id;
          const opponentName = isHome ? match.away.name : match.home.name;

          setNextMatch({
            id: match.match_id_int,
            opponent: opponentName,
            date: parseISO(match.match_date),
            isHome
          });
        }

        // Fetch league position using direct SQL query instead of RPC
        const { data: positionData, error: positionError } = await supabase
          .from('series_members')
          .select(`
            series_id,
            team_id
          `)
          .eq('team_id', team.team_id)
          .single();

        if (positionError) {
          console.error("Error fetching league position:", positionError);
        } else if (positionData) {
          // Calculate league position using direct query
          const { data: leagueTeams, error: leagueError } = await supabase
            .from('series_members')
            .select('team_id')
            .eq('series_id', positionData.series_id);

          if (leagueError) {
            console.error("Error fetching league teams:", leagueError);
          } else if (leagueTeams) {
            // Calculate position based on team performance
            const { data: teamsWithStats, error: statsError } = await supabase
              .from('matches')
              .select(`
                home_team_id,
                away_team_id,
                home_score,
                away_score
              `)
              .eq('status', 'completed')
              .eq('series_id', positionData.series_id);

            if (statsError) {
              console.error("Error fetching match stats:", statsError);
            } else if (teamsWithStats) {
              // Calculate points for all teams
              const teamStats = {};
              leagueTeams.forEach(lt => {
                teamStats[lt.team_id] = {
                  points: 0,
                  played: 0,
                  goalsFor: 0,
                  goalsAgainst: 0
                };
              });

              teamsWithStats.forEach(match => {
                if (teamStats[match.home_team_id]) {
                  teamStats[match.home_team_id].played += 1;
                  teamStats[match.home_team_id].goalsFor += match.home_score || 0;
                  teamStats[match.home_team_id].goalsAgainst += match.away_score || 0;

                  if (match.home_score > match.away_score) {
                    teamStats[match.home_team_id].points += 3;
                  } else if (match.home_score === match.away_score) {
                    teamStats[match.home_team_id].points += 1;
                  }
                }

                if (teamStats[match.away_team_id]) {
                  teamStats[match.away_team_id].played += 1;
                  teamStats[match.away_team_id].goalsFor += match.away_score || 0;
                  teamStats[match.away_team_id].goalsAgainst += match.home_score || 0;

                  if (match.away_score > match.home_score) {
                    teamStats[match.away_team_id].points += 3;
                  } else if (match.away_score === match.home_score) {
                    teamStats[match.away_team_id].points += 1;
                  }
                }
              });

              // Sort teams by points
              const sortedTeams = Object.keys(teamStats).map(id => ({
                teamId: parseInt(id),
                ...teamStats[id]
              })).sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                const bGoalDiff = b.goalsFor - b.goalsAgainst;
                const aGoalDiff = a.goalsFor - a.goalsAgainst;
                if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
                return b.goalsFor - a.goalsFor;
              });

              // Find position of the team
              const position = sortedTeams.findIndex(t => t.teamId === team.team_id) + 1;
              if (position > 0) {
                setLeaguePosition({
                  position,
                  total: sortedTeams.length
                });
              }
            }
          }
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
