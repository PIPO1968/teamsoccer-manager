
import SeriesStandingsTable from "./series/SeriesStandingsTable";
import DivisionNavigation from "./series/DivisionNavigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const { language } = useLanguage();
  const [availableSeasons, setAvailableSeasons] = useState<SeasonEntry[]>([]);

  useEffect(() => {
    if (!seriesId) return;
    apiFetch<{ success: boolean; seasons: SeasonEntry[] }>(`/series/${seriesId}/seasons`)
      .then(d => setAvailableSeasons(d.seasons || []))
      .catch(() => setAvailableSeasons([]));
  }, [seriesId]);

  if (leagueLoading || hierarchyLoading || seasonLoading) {
    return <div>Loading series data...</div>;
  }

  if (leagueError || hierarchyError || !league) {
    return <div>Error: {leagueError || hierarchyError || "Series not found"}</div>;
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
                        Season {s.season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-sm text-white font-medium drop-shadow-lg">Season {league.season}</span>
              )}
              <span className="text-white/80 text-sm">|</span>
              <span className="text-sm text-white font-medium drop-shadow-lg">Week {seasonInfo?.current_week}</span>
            </div>
          </div>
          <CardContent className="p-4">
            <DivisionNavigation
              currentSeries={currentSeries}
              higherSeries={higherSeries}
              lowerSeries={lowerSeries}
            />
            <SeriesStandingsTable teams={league.teams} />
          </CardContent>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <nav>
              <Link to={`/series/${seriesId}/fixtures`} className="block text-sm text-primary hover:underline">Fixtures</Link>
            </nav>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Series;
