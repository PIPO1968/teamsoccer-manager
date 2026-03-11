
import SeriesStandingsTable from "./series/SeriesStandingsTable";

import DivisionNavigation from "./series/DivisionNavigation";
import SeriesStatsBlock from "./series/SeriesStatsBlock";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useLeagueHierarchy } from "@/hooks/useLeagueHierarchy";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { Flag } from "@/components/ui/flag";
import { toRomanNumeral } from "@/utils/romanNumerals";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useTeamMatches } from "@/hooks/useTeamMatches";

type SeasonEntry = { series_id: number; season: number };

const Series = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { league, isLoading: leagueLoading, error: leagueError } = useLeagueData(seriesId);
  const {
    currentSeries,
    higherSeries,
    lowerSeries,
    isLoading: hierarchyLoading,
    error: hierarchyError
  } = useLeagueHierarchy(seriesId);
  const { seasonInfo, isLoading: seasonLoading } = useCurrentSeason();
  const { language, t } = useLanguage();
  const [availableSeasons, setAvailableSeasons] = useState<SeasonEntry[]>([]);

  useEffect(() => {
    if (!seriesId) return;
    apiFetch<{ success: boolean; seasons: SeasonEntry[] }>(`/series/${seriesId}/seasons`)
      .then(d => setAvailableSeasons(d.seasons || []))
      .catch(() => setAvailableSeasons([]));
  }, [seriesId]);

  if (leagueLoading || hierarchyLoading || seasonLoading) {
    return <div>{t('series.loading')}</div>;
  }

  if (leagueError || hierarchyError || !league) {
    return <div>Error: {leagueError || hierarchyError || t('series.notFound')}</div>;
  }

  // Obtener equipo del usuario y sus partidos
  const { team: userTeam } = useUserTeam();
  const { matches: userMatches, isLoading: matchesLoading } = useTeamMatches(userTeam?.team_id ? String(userTeam.team_id) : undefined);

  // Buscar el próximo partido (scheduled y fecha futura)
  let nextMatch = null;
  if (userMatches && userMatches.length > 0) {
    const now = new Date();
    nextMatch = userMatches
      .filter(m => m.status === "scheduled" && new Date(m.match_date) > now)
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())[0] || null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="teamsoccer-panel">
          <div className="teamsoccer-header flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2 text-shadow-lg">
              <Flag countryId={league.region_id} />
              <span className="drop-shadow-lg">
                {localizeCountryName(league.region_name, language)} - {toRomanNumeral(currentSeries?.division || league.division)}.{currentSeries?.group_number || league.group_number}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {availableSeasons.length > 1 ? (
                <Select
                  value={seriesId}
                  onValueChange={(val) => navigate(`/series/${val}`)}
                >
                  <SelectTrigger className="h-7 text-xs bg-white/15 border-white/30 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeasons.map((s) => (
                      <SelectItem key={s.series_id} value={String(s.series_id)}>
                        {t('series.season')} {s.season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-white font-medium drop-shadow-lg">{t('series.season')} {league.season}</span>
              )}
              <span className="text-white/80 text-sm">|</span>
              <span className="text-sm text-white font-medium drop-shadow-lg">{t('series.week')} {seasonInfo?.current_week}</span>
            </div>
          </div>
          <CardContent className="p-4">
            <DivisionNavigation
              currentSeries={currentSeries}
              higherSeries={higherSeries}
              lowerSeries={lowerSeries}
            />
            <SeriesStandingsTable teams={league.teams} division={league.division} groupNumber={league.group_number} />
            {/* Bloque próximo partido del equipo del usuario */}
            {userTeam && !matchesLoading && nextMatch && (
              <div className="my-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-sm font-semibold text-blue-900 mb-2">{t('matches.nextMatch')}</div>
                  <div className="flex items-center gap-2 text-base font-bold">
                    <span>{nextMatch.is_home ? userTeam.name : nextMatch.away_team_name}</span>
                    <span className="text-blue-700">vs</span>
                    <span>{nextMatch.is_home ? nextMatch.away_team_name : userTeam.name}</span>
                  </div>
                  <div className="text-xs text-blue-800 mt-1">
                    {new Date(nextMatch.match_date).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>
        <SeriesStatsBlock seriesId={seriesId!} />
      </div>
    </div>
  );
};

export default Series;
