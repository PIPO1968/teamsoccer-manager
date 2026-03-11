
import { useLanguage } from "@/contexts/LanguageContext";

interface LeagueStatsProps {
  totalTeams: number;
  totalManagers: number;
  totalSeries: number;
}

const LeagueStats = ({ totalTeams, totalManagers, totalSeries }: LeagueStatsProps) => {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">{t('league.totalTeams')}</div>
        <div className="text-2xl font-bold">{totalTeams}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">{t('league.totalManagers')}</div>
        <div className="text-2xl font-bold">{totalManagers}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">{t('league.totalSeries')}</div>
        <div className="text-2xl font-bold">{totalSeries}</div>
      </div>
    </div>
  );
};

export default LeagueStats;
