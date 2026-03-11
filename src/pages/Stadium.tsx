
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStadiumData } from "@/hooks/useStadiumData";
import { useStadiumMatches } from "@/hooks/useStadiumMatches";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { StadiumHeader } from "./Stadium/components/StadiumHeader";
import { StadiumVisualization } from "./Stadium/components/StadiumVisualization";
import { StadiumInformation } from "./Stadium/components/StadiumInformation";
import { StadiumLoading } from "./Stadium/components/StadiumLoading";
import { StadiumAttendanceSection } from "./Stadium/components/StadiumAttendanceSection";
import { StadiumExpansionSection } from "./Stadium/components/StadiumExpansionSection";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useLanguage } from "@/contexts/LanguageContext";

const Stadium = () => {
  useCompleteCarnetTest('visit_stadium');
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const { stadium, isLoading, error, refetch } = useStadiumData(stadiumId);
  const { matches, isLoading: matchesLoading } = useStadiumMatches(stadiumId);
  const { league, isLoading: leagueLoading } = useTeamLeague(stadium?.team_id.toString());
  const { finances, refetch: refetchFinances } = useTeamFinances(stadium?.team_id.toString());
  const { manager } = useAuth();
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

  const playedMatches = matches
    .filter(match => match.status === 'completed')
    .slice(0, 10); // Last 10 for attendance section

  const isOwner = manager?.team_id === stadium?.team_id;

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

      {/* Ampliación del estadio — solo para el propietario */}
      {isOwner && (
        <div className="w-full">
          <StadiumExpansionSection
            stadiumId={stadium.stadium_id}
            teamId={stadium.team_id}
            currentCapacity={stadium.stadium_capacity || 2500}
            cashBalance={finances?.cash_balance ?? 0}
            currentStanding={stadium.seats_standing ?? 0}
            currentBasic={stadium.seats_basic ?? 0}
            currentCovered={stadium.seats_covered ?? 0}
            currentVip={stadium.seats_vip ?? 0}
            onExpanded={() => { refetch?.(); refetchFinances?.(); }}
          />
        </div>
      )}

      {/* Attendance & Earnings Section - Full Width */}
      <div className="w-full">
        <StadiumAttendanceSection
          matches={playedMatches}
          stadiumCapacity={stadium.stadium_capacity || 15000}
          seatsStanding={stadium.seats_standing ?? 0}
          seatsBasic={stadium.seats_basic ?? 0}
          seatsCovered={stadium.seats_covered ?? 0}
          seatsVip={stadium.seats_vip ?? 0}
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
