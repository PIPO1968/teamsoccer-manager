
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Flag, Star, Trophy as LeagueTrophy } from "lucide-react";
import type { TeamData } from "@/hooks/useTeamData";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";
import { Link, useParams } from "react-router-dom";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { useAuth } from "@/contexts/AuthContext";
import { useStadiumIdByTeamId } from "@/hooks/useStadiumIdByTeamId";
import { ManagerStatusIndicators } from "@/components/manager/ManagerStatusIndicators";
import { toRomanNumeral } from "@/utils/romanNumerals";

interface ClubDetailsProps {
  team: TeamData | null;
}

export default function ClubDetails({ team }: ClubDetailsProps) {
  const { teamId } = useParams<{ teamId: string }>();
  const { league, isLoading: leagueLoading } = useTeamLeague(team?.team_id?.toString());
  const { manager } = useAuth();
  const { stadiumId } = useStadiumIdByTeamId(team?.team_id);
  const { t, language } = useLanguage();

  console.log('ClubDetails rendering with:', {
    'Team data': team,
    'Team ID from params': teamId,
    'Manager data': manager?.user_id,
    'Team manager ID': team?.manager_id,
    'Stadium ID': stadiumId
  });

  const getAdminPrefix = (isAdmin: number) => {
    switch (isAdmin) {
      case 4: return 'DEV-';
      case 3: return 'STAFF-';
      case 2: return 'ADMIN-';
      case 1: return 'MOD-';
      default: return '';
    }
  };

  if (!team) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3">{t('team.clubDetails')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <LeagueTrophy className="h-4 w-4 text-muted-foreground" />
              <span>
                {leagueLoading ? (
                  t('team.loadingLeague')
                ) : league ? (
                  <>
                    {t('team.competesIn')}{" "}
                    <Link to={`/series/${league.series_id}`} className="text-green-700 hover:underline">
                      {localizeCountryName(league.region_name, language)} {toRomanNumeral(league.division)}.{league.group_number}
                    </Link>
                  </>
                ) : (
                  t('team.leagueNotAvailable')
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>
                {team.is_bot === 1
                  ? t('team.noHumanManager')
                  : team.manager_id ? (
                    <div className="flex items-center gap-1">
                      {t('team.managedBy')}{" "}
                      <Link to={`/manager/${team.manager_id}`} className="text-green-700 hover:underline">
                        {getAdminPrefix(team.is_admin || 0)}{team.manager_username || team.manager_name || "Unknown Manager"}
                      </Link>
                      {team.manager_id && (
                        <ManagerStatusIndicators
                          managerId={parseInt(team.manager_id)}
                          isPremium={team.is_premium || 0}
                          isAdmin={team.is_admin || 0}
                        />
                      )}
                    </div>
                  ) : (
                    t('team.unknownManager')
                  )
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{t('team.fanClub').replace('{count}', String(team.fan_count || 0))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <span>{t('team.stadiumLabel')}{' '}
                <Link to={`/stadium/${stadiumId || team.team_id}`} className="text-green-700 hover:underline">
                  {team.stadium_name || '?'}
                </Link>
                {' '}{t('team.capacityLabel').replace('{capacity}', String(team.stadium_capacity?.toLocaleString() || '?'))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span>{t('team.teamSpiritLabel')} {team.team_spirit || '?'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
