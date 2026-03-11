
import { useParams } from "react-router-dom";
import TeamHeader from "./team/TeamHeader";
import TeamSidebar from "./team/TeamSidebar";
import CompetitionInfo from "./team/CompetitionInfo";
import ClubDetails from "./team/ClubDetails";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamData } from "@/hooks/useTeamData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Team() {
  const { teamId } = useParams<{ teamId: string }>();
  const { team, isLoading, error } = useTeamData(teamId);
  const { t } = useLanguage();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">{t('team.error')}</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ) : (
        <TeamHeader team={team} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompetitionInfo />
            {isLoading ? (
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-32 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ClubDetails team={team} />
            )}
          </div>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">{t('team.pressAnnouncement')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('team.noPressAnnouncement')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">{t('team.teamEvents')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('team.noTeamEvents')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {isLoading ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <TeamSidebar />
          )}
        </div>
      </div>
    </div>
  );
}
