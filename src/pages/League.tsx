
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('league.loading')}</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t('league.error')}</h1>
          <p className="text-lg text-gray-600 mb-4">{error || t('league.notFound')}</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            {t('common.returnHome', 'Volver al inicio')}
          </a>
        </div>
      </div>
    );
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
