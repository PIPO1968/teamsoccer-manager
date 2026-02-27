
import SeriesStandingsTable from "./series/SeriesStandingsTable";
import DivisionNavigation from "./series/DivisionNavigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useLeagueHierarchy } from "@/hooks/useLeagueHierarchy";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { Flag } from "@/components/ui/flag";
import { toRomanNumeral } from "@/utils/romanNumerals";

const Series = () => {
  const { seriesId } = useParams();
  const { league, isLoading: leagueLoading, error: leagueError } = useLeagueData(seriesId);
  const { 
    currentSeries, 
    higherSeries, 
    lowerSeries, 
    isLoading: hierarchyLoading, 
    error: hierarchyError 
  } = useLeagueHierarchy(seriesId);
  const { seasonInfo, isLoading: seasonLoading } = useCurrentSeason();
  
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
                {league.region_name} - {toRomanNumeral(currentSeries?.division || league.division)}.{currentSeries?.group_number || league.group_number}
              </span>
            </h2>
            <div className="text-sm text-white font-medium flex items-center gap-2 drop-shadow-lg">
              <span>Season {seasonInfo?.current_season}</span>
              <span className="text-white/80">|</span>
              <span>Week {seasonInfo?.current_week}</span>
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
