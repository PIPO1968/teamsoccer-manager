
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TeamData } from "@/hooks/useTeamData";
import { Link } from "react-router-dom";
import { Users, Flag as FlagIcon } from "lucide-react";
import { Flag } from "@/components/ui/flag";
import { TeamLogoUpload } from "@/components/team/TeamLogoUpload";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamHeaderProps {
  team: TeamData | null;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  const { t } = useLanguage();
  if (!team) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Club Logo Section */}
          <div className="flex-shrink-0">
            <div className="w-64 h-64 mx-auto md:mx-0">
              {team.club_logo ? (
                <img
                  src={team.club_logo}
                  alt={`${team.name} logo`}
                  className="w-full h-full object-contain rounded-lg border"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center border">
                  <span className="text-gray-500 text-sm">{t('team.noLogo')}</span>
                </div>
              )}
            </div>
            <div className="mt-4 w-64 mx-auto md:mx-0">
              <TeamLogoUpload team={team} />
            </div>
          </div>

          {/* Team Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {team.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <div className="flex items-center gap-2">
                {team.country_id ? (
                  <Flag countryId={team.country_id} className="max-w-[28px] max-h-[20px]" />
                ) : (
                  <FlagIcon className="h-4 w-4" />
                )}
                <span className="text-sm text-gray-600">{team.country}</span>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{team.fan_count?.toLocaleString()} {t('team.fansCount')}</span>
              </div>

              {team.is_bot === 1 && (
                <Badge variant="outline" className="text-xs">
                  {t('team.botTeam')}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="secondary">
                {t('team.ratingBadge')} {team.team_rating}
              </Badge>
              <Badge variant="secondary">
                {t('team.moraleBadge')} {team.team_morale}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
