
import { useParams } from "react-router-dom";
import { useLeagueStats } from "@/hooks/useLeagueStats";
import LeagueHeader from "./league/LeagueHeader";
import LeagueStats from "./league/LeagueStats";
import SeriesList from "./league/SeriesList";

const League = () => {
  const { leagueId } = useParams();
  const { stats, isLoading, error } = useLeagueStats(leagueId);

  if (isLoading) {
    return <div>Loading league data...</div>;
  }

  if (error || !stats) {
    return <div>Error: {error || "League not found"}</div>;
  }

  return (
    <div className="space-y-6">
      <LeagueHeader 
        regionName={stats.regionName} 
        regionId={stats.regionId} 
      />
      <LeagueStats 
        totalTeams={stats.totalTeams}
        totalManagers={stats.totalManagers}
        totalSeries={stats.totalSeries}
      />
      <SeriesList series={stats.seriesList} />
    </div>
  );
};

export default League;
