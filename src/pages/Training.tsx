
import TrainingActions from "./training/TrainingActions";
import TrainingPlayersList from "./training/TrainingPlayersList";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";

export default function Training() {
  const { team } = useUserTeam();
  const { players, isLoading } = useTeamPlayers(team?.team_id?.toString());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Training Players List */}
          <TrainingPlayersList 
            players={players} 
            isLoading={isLoading}
          />
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <TrainingActions />
        </div>
      </div>
    </div>
  );
}
