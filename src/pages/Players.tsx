
import { useParams } from "react-router-dom";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import PlayerSquadList from "./players/PlayerSquadList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamData } from "@/hooks/useTeamData";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useUserTeam } from '@/hooks/useUserTeam';
import { useLanguage } from "@/contexts/LanguageContext";

const Players = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { team: ownTeam } = useUserTeam();
  useCompleteCarnetTest('visit_players', !!teamId && teamId === String(ownTeam?.team_id));
  const [sortBy, setSortBy] = useState<string>("firstName");
  const { players, isLoading, error } = useTeamPlayers(teamId);
  const { team, isLoading: isTeamLoading } = useTeamData(teamId);
  const { t } = useLanguage();

  const sortOptions = [
    { value: "firstName", label: t('players.sort.firstName') },
    { value: "lastName", label: t('players.sort.lastName') },
    { value: "age", label: t('players.sort.age') },
    { value: "fitness", label: t('players.sort.fitness') },
    { value: "value", label: t('players.sort.value') },
    { value: "finishing", label: t('players.sort.finishing') },
    { value: "pace", label: t('players.sort.pace') },
    { value: "passing", label: t('players.sort.passing') },
    { value: "defense", label: t('players.sort.defense') },
    { value: "dribbling", label: t('players.sort.dribbling') },
    { value: "heading", label: t('players.sort.heading') },
    { value: "stamina", label: t('players.sort.stamina') },
  ];

  const sortPlayers = (players: any[]) => {
    return [...players].sort((a, b) => {
      if (sortBy === "firstName") {
        return a.first_name.localeCompare(b.first_name);
      }
      if (sortBy === "lastName") {
        return a.last_name.localeCompare(b.last_name);
      }
      if (sortBy === "value" || sortBy === "age" || sortBy === "fitness") {
        return b[sortBy] - a[sortBy];
      }
      // For skill-based sorting
      return b[sortBy] - a[sortBy];
    });
  };

  const sortedPlayers = players ? sortPlayers(players) : [];

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="teamsoccer-panel">
      <div className="teamsoccer-header">
        <h1 className="text-white">{team?.name ? `${team.name} > ${t('players.title')}` : t('players.title')}</h1>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">
            {t('players.count').replace('{n}', isLoading ? "..." : String(sortedPlayers.length))}
          </h2>
          <div className="w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t('players.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <PlayerSquadList players={sortedPlayers} />
        )}
      </div>
    </div>
  );
};

export default Players;
