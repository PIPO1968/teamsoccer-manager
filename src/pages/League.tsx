
import { useParams } from "react-router-dom";
import { useLeagueStats } from "@/hooks/useLeagueStats";
import { useLanguage } from "@/contexts/LanguageContext";
import LeagueHeader from "./league/LeagueHeader";
import LeagueStats from "./league/LeagueStats";
import SeriesList from "./league/SeriesList";

const League = () => {
  const { leagueId } = useParams();
  const { stats, isLoading, error } = useLeagueStats(leagueId);
  const { t } = useLanguage();

  if (isLoading) {
    return <div>{t('league.loading')}</div>;
  }

  if (error || !stats) {
    return <div>{t('league.error')}: {error || t('league.notFound')}</div>;
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
