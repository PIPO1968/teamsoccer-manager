
import SeriesStandingsTable from "./series/SeriesStandingsTable";
import SeriesFixtures from "./series/SeriesFixtures";
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
            <Tabs defaultValue="standings" className="mt-4">
              <TabsList className="mb-2">
                <TabsTrigger value="standings">{t('series.standings')}</TabsTrigger>
                <TabsTrigger value="fixtures">{t('series.fixtures')}</TabsTrigger>
              </TabsList>
              <TabsContent value="standings">
                <SeriesStandingsTable teams={league.teams} division={league.division} groupNumber={league.group_number} />
              </TabsContent>
              <TabsContent value="fixtures">
                <SeriesFixtures />
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
        <SeriesStatsBlock seriesId={seriesId!} />
      </div>
    </div>
  );
};

export default Series;
