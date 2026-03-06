import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { GAME_NAME } from "@/config/constants";
import { useAuth } from "@/contexts/AuthContext";
import { WaitingListDashboard } from "@/components/dashboard/WaitingListDashboard";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  useCompleteCarnetTest('visit_dashboard');
  const { isWaitingList } = useAuth();
  const { t } = useLanguage();
  const {
    team,
    league,
    recentMatches,
    nextMatch,
    getFormattedMatchDate,
    isLoading
  } = useDashboardData();

  // Show waiting list dashboard for waiting list users
  if (isWaitingList) {
    return <WaitingListDashboard />;
  }

  if (isLoading || !team) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.overview')}</h1>
        <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'Win':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'Loss':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.overview')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')} {GAME_NAME}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.teamRating')}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.team_rating}/100</div>
            <Progress value={team.team_rating} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-2">
              {team.team_rating > 85 ? t('dashboard.elite') :
                team.team_rating > 75 ? t('dashboard.professional') :
                  team.team_rating > 65 ? t('dashboard.goodLevel') : t('dashboard.developing')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.nextMatch')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextMatch ? (
              <>
                <div className="text-md font-bold">
                  {nextMatch.isHome ? `${t('dashboard.home')} ` : `${t('dashboard.away')} `}
                  <Link to={`/match/${nextMatch.id}`} className="hover:underline">
                    {nextMatch.opponent}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getFormattedMatchDate(nextMatch.date)}
                </p>
              </>
            ) : (
              <>
                <div className="text-md font-bold">{t('dashboard.noUpcoming')}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('dashboard.checkSchedule')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.teamMorale')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.team_morale >= 80 ? t('dashboard.excellent') :
                team.team_morale >= 65 ? t('dashboard.good') :
                  team.team_morale >= 50 ? t('dashboard.average') :
                    team.team_morale >= 35 ? t('dashboard.poor') : t('dashboard.terrible')}
            </div>
            <Progress value={team.team_morale} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.recentMatches')}</CardTitle>
            <CardDescription>{t('dashboard.lastResults').replace('{n}', String(recentMatches.length || 5))}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-8 rounded-full ${match.result === "Win" ? "bg-green-500" :
                          match.result === "Draw" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          {match.opponent} {getResultIcon(match.result)}
                        </p>
                        <p className="text-xs text-muted-foreground">{match.date}</p>
                      </div>
                    </div>
                    <div className="font-medium">{match.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard.noHistory')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
