
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { PlayerData } from "@/hooks/useTeamPlayers";
import PlayerTrainingRow from "./PlayerTrainingRow";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrainingTableProps {
  players: PlayerData[];
  playerTrainings: Map<number, { playerId: number; trainingType: number; intensity: number; }>;
  onTrainingTypeChange: (playerId: number, trainingType: number) => void;
  onIntensityChange: (playerId: number, intensity: number) => void;
}

export default function TrainingTable({
  players,
  playerTrainings,
  onTrainingTypeChange,
  onIntensityChange
}: TrainingTableProps) {
  const { t } = useLanguage();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('training.player')}</TableHead>
          <TableHead>{t('training.position')}</TableHead>
          <TableHead>{t('training.trainingType')}</TableHead>
          <TableHead>{t('training.intensity')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const currentTraining = playerTrainings.get(player.player_id);
          const playerTrainingType = currentTraining?.trainingType || 0;
          const playerIntensity = currentTraining?.intensity || 100;

          return (
            <PlayerTrainingRow
              key={player.player_id}
              player={player}
              trainingType={playerTrainingType}
              intensity={playerIntensity}
              onTrainingTypeChange={onTrainingTypeChange}
              onIntensityChange={onIntensityChange}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
