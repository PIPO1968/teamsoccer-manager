
import { useParams } from "react-router-dom";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import PlayerSquadList from "./players/PlayerSquadList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamData } from "@/hooks/useTeamData";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useAuth } from '@/contexts/AuthContext';

const sortOptions = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "age", label: "Age" },
  { value: "fitness", label: "Fitness" },
  { value: "value", label: "Value" },
  { value: "finishing", label: "Finishing" },
  { value: "pace", label: "Pace" },
  { value: "passing", label: "Passing" },
  { value: "defense", label: "Defense" },
  { value: "dribbling", label: "Dribbling" },
  { value: "heading", label: "Heading" },
  { value: "stamina", label: "Stamina" },
];

const Players = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { manager } = useAuth();
  useCompleteCarnetTest('visit_players', !!teamId && teamId === String(manager?.team_id));
  const [sortBy, setSortBy] = useState<string>("firstName");
  const { players, isLoading, error } = useTeamPlayers(teamId);
  const { team, isLoading: isTeamLoading } = useTeamData(teamId);

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
        <h1 className="text-white">{team?.name ? `${team.name} > Players` : 'Players'}</h1>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">
            The team has {isLoading ? "..." : sortedPlayers.length} players
          </h2>
          <div className="w-48">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
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
