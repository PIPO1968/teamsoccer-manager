
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStadiumData } from "@/hooks/useStadiumData";
import { useStadiumMatches } from "@/hooks/useStadiumMatches";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { Skeleton } from "@/components/ui/skeleton";
import { StadiumMatchesSection } from "./Stadium/components/StadiumMatchesSection";
import { StadiumHeader } from "./Stadium/components/StadiumHeader";
import { StadiumVisualization } from "./Stadium/components/StadiumVisualization";
import { StadiumInformation } from "./Stadium/components/StadiumInformation";
import { StadiumLoading } from "./Stadium/components/StadiumLoading";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useLanguage } from "@/contexts/LanguageContext";

const Stadium = () => {
  useCompleteCarnetTest('visit_stadium');
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const { stadium, isLoading, error } = useStadiumData(stadiumId);
  const { matches, isLoading: matchesLoading } = useStadiumMatches(stadiumId);
  const { league, isLoading: leagueLoading } = useTeamLeague(stadium?.team_id.toString());
  const { t } = useLanguage();

  if (isLoading || leagueLoading) {
    return <StadiumLoading />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('stadium.error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stadium) {
    return (
      <Alert>
        <AlertTitle>{t('stadium.notFound')}</AlertTitle>
        <AlertDescription>{t('stadium.notFoundDesc')}</AlertDescription>
      </Alert>
    );
  }

  // Split matches into recent and upcoming
  const now = new Date();
  const recentMatches = matches
    .filter(match => match.status === 'completed')
    .slice(0, 5); // Show last 5 completed matches

  const upcomingMatches = matches
    .filter(match => match.status === 'scheduled' && new Date(match.match_date) > now)
    .slice(0, 5); // Show next 5 upcoming matches

  return (
    <div className="space-y-6">
      <StadiumHeader stadium={stadium} league={league} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stadium 3D View */}
        <div className="lg:col-span-1">
          <StadiumVisualization stadium={stadium} />
        </div>

        {/* Stadium Information */}
        <div className="lg:col-span-2">
          <StadiumInformation stadium={stadium} />
        </div>
      </div>

      {/* Recent Matches Section - Full Width */}
      <div className="w-full">
        <StadiumMatchesSection
          title={`${t('stadium.recentMatchesFor')} ${stadium.team_name}`}
          matches={recentMatches}
          emptyMessage={t('stadium.noRecentMatches')}
          showResult={false}
        />
      </div>

      {/* Upcoming Matches Section - Full Width */}
      <div className="w-full">
        <StadiumMatchesSection
          title={t('stadium.upcomingMatches')}
          matches={upcomingMatches}
          emptyMessage={t('stadium.noUpcomingMatches')}
          showResult={false}
        />
      </div>

      {matchesLoading && (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
    </div>
  );
};

export default Stadium;
