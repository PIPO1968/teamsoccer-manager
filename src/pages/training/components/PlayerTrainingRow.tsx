
import { TableRow, TableCell } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { Link } from "react-router-dom";

interface PlayerTrainingRowProps {
  player: PlayerData;
  trainingType: number;
  intensity: number;
  onTrainingTypeChange: (playerId: number, trainingType: number) => void;
  onIntensityChange: (playerId: number, intensity: number) => void;
}

export default function PlayerTrainingRow({
  player,
  trainingType,
  intensity,
  onTrainingTypeChange,
  onIntensityChange
}: PlayerTrainingRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div>
          <Link 
            to={`/players/${player.player_id}`}
            className="font-medium text-primary hover:underline"
          >
            {player.first_name} {player.last_name}
          </Link>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{player.position}</Badge>
      </TableCell>
      <TableCell>
        <select
          value={trainingType}
          onChange={(e) => onTrainingTypeChange(player.player_id, parseInt(e.target.value))}
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
        >
          <option value={0}>No Training</option>
          <option value={1}>Goalkeeper</option>
          <option value={2}>Defense</option>
          <option value={3}>Passing</option>
          <option value={4}>Crossing</option>
          <option value={5}>Dribbling</option>
          <option value={6}>Heading</option>
          <option value={7}>Scoring</option>
        </select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Slider
            value={[intensity]}
            onValueChange={(value) => onIntensityChange(player.player_id, value[0])}
            max={100}
            min={1}
            step={1}
            className="flex-1 min-w-[120px]"
          />
          <span className="text-sm font-medium w-12">{intensity}%</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
