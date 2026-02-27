
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { useTrainingManagement } from "./hooks/useTrainingManagement";
import TrainingTable from "./components/TrainingTable";

interface TrainingPlayersListProps {
  players: PlayerData[];
  isLoading: boolean;
}

export default function TrainingPlayersList({ 
  players, 
  isLoading
}: TrainingPlayersListProps) {
  const {
    playerTrainings,
    isSaving,
    handleTrainingTypeChange,
    handleIntensityChange,
    saveAllTrainings
  } = useTrainingManagement(players);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-8">Loading players...</div>
        </CardContent>
      </Card>
    );
  }

  if (!players.length) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-8">No players found.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle>Team Training</CardTitle>
        <Button 
          onClick={saveAllTrainings} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save All"}
        </Button>
      </CardHeader>
      <CardContent>
        <TrainingTable
          players={players}
          playerTrainings={playerTrainings}
          onTrainingTypeChange={handleTrainingTypeChange}
          onIntensityChange={handleIntensityChange}
        />
      </CardContent>
    </Card>
  );
}
