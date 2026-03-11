
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { Flag } from "@/components/ui/flag";
import { PlayerAvatar } from "@/components/avatar/PlayerAvatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";

const SKILL_LEVELS = [
  { min: 1, name: "poor", color: "bg-red-500" },
  { min: 4, name: "weak", color: "bg-orange-500" },
  { min: 6, name: "decent", color: "bg-amber-500" },
  { min: 8, name: "good", color: "bg-blue-500" },
  { min: 11, name: "excellent", color: "bg-green-500" },
  { min: 14, name: "outstanding", color: "bg-indigo-500" },
  { min: 17, name: "world class", color: "bg-violet-500" }
];

function skillDescriptor(level: number): { name: string; color: string } {
  for (let i = SKILL_LEVELS.length - 1; i >= 0; i--) {
    if (level >= SKILL_LEVELS[i].min) return SKILL_LEVELS[i];
  }
  return SKILL_LEVELS[0];
}

function formatMoney(value?: number) {
  if (!value) return "-";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${(value / 1000).toFixed(0)}K`;
}

function formatForm(form: string) {
  switch (form) {
    case "Excellent":
      return "bg-green-100 text-green-800 border-green-200";
    case "Good":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Average":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Poor":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

interface PlayerSquadListProps {
  players: PlayerData[];
}

export default function PlayerSquadList({ players }: PlayerSquadListProps) {
  const { t, language } = useLanguage();

  const getSkillColor = (level: number) => {
    if (level >= 15) return "bg-violet-500";
    if (level >= 12) return "bg-blue-500";
    if (level >= 9) return "bg-green-500";
    if (level >= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  const formKey = (form: string) => {
    const map: Record<string, string> = {
      Excellent: 'player.form.excellent', Good: 'player.form.good',
      Average: 'player.form.average', Poor: 'player.form.poor',
    };
    return map[form] || form;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {players.map((player) => (
        <div
          key={player.player_id}
          className="teamsoccer-panel hover:shadow-md transition-shadow duration-200"
        >
          <div className="teamsoccer-header flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link
                to={`/players/${player.player_id}`}
                className="font-semibold hover:underline text-white"
              >
                {`${player.first_name} ${player.last_name}`}
              </Link>
              {player.nationality_id ? (
                <Flag countryId={player.nationality_id} />
              ) : (
                player.nationality && <Flag country={player.nationality} />
              )}
            </div>
            <Badge variant="secondary" className="bg-white text-teamsoccer-green hover:bg-gray-100">
              {Math.round((player.finishing + player.pace + player.passing + player.defense) / 4)}
            </Badge>
          </div>

          <div className="p-4">
            <div className="flex gap-3">
              <div className="relative">
                <PlayerAvatar
                  player={player}
                  size="md"
                  className="w-16 h-16"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{player.nationality ? localizeCountryName(player.nationality, language) : t('player.unknown')}</span>
                  <span>•</span>
                  <span>{player.age} {t('player.age').toLowerCase()}</span>
                  <span>•</span>
                  <span>{formatMoney(player.wage)}/{t('player.week')}</span>
                  <span>•</span>
                  <span>{player.matches_played} {t('player.matches')}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${formatForm(player.form)}`}>
                    {t(formKey(player.form))}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {t('player.fitness')}: {player.fitness}%
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                    {t('player.goals')}: {player.goals}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {t('player.value')}: {formatMoney(player.value)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-md border border-gray-100">
              {/* Técnicas */}
              <div className="text-xs font-bold text-blue-700 mb-1">{t('player.category.technical')}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                {[
                  { skill: "finishing", value: player.finishing },
                  { skill: "passing", value: player.passing },
                  { skill: "defense", value: player.defense },
                  { skill: "dribbling", value: player.dribbling },
                  { skill: "heading", value: player.heading },
                  { skill: "crosses", value: (player as any).crosses },
                  { skill: "ball_control", value: (player as any).ball_control },
                  { skill: "goalkeeper", value: (player as any).goalkeeper },
                ].map(({ skill, value }) => (
                  <div key={skill} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 w-16">
                      {t(`player.skill.${skill}`)}
                    </span>
                    <div className="flex-1">
                      <Progress
                        value={value ? (value / 100) * 100 : 0}
                        className="h-2 bg-slate-200"
                        indicatorClassName={getSkillColor(value || 0)}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-6 text-right">
                      {value ?? 0}
                    </span>
                  </div>
                ))}
              </div>
              {/* Físicas */}
              <div className="text-xs font-bold text-green-700 mt-2 mb-1">{t('player.category.physical')}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { skill: "stamina", value: player.stamina },
                  { skill: "pace", value: player.pace },
                ].map(({ skill, value }) => (
                  <div key={skill} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 w-16">
                      {t(`player.skill.${skill}`)}
                    </span>
                    <div className="flex-1">
                      <Progress
                        value={value ? (value / 100) * 100 : 0}
                        className="h-2 bg-slate-200"
                        indicatorClassName={getSkillColor(value || 0)}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-6 text-right">
                      {value ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
