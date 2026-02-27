
import React from 'react';
import { PlayerData } from '@/hooks/useTeamPlayers';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlayerDetailsProps {
  player: PlayerData;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ player }) => {
  // Calculate attribute percentages for progress bars
  const toPercentage = (value: number) => (value / 20) * 100;
  
  // Get color based on attribute value
  const getAttributeColor = (value: number) => {
    if (value >= 15) return "bg-green-500";
    if (value >= 10) return "bg-yellow-500";
    if (value >= 5) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold">{player.first_name} {player.last_name}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{player.age} years</span>
            <span>•</span>
            <span className="text-sm">{player.nationality || 'Unknown'}</span>
            <Badge>{player.position}</Badge>
          </div>
        </div>
        <div className="bg-green-600 text-white h-8 w-8 flex items-center justify-center rounded-full font-bold">
          {player.rating}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Pace</span>
            <span>{player.pace}/20</span>
          </div>
          <Progress value={toPercentage(player.pace)} className="h-1.5" indicatorClassName={getAttributeColor(player.pace)} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Finishing</span>
            <span>{player.finishing}/20</span>
          </div>
          <Progress value={toPercentage(player.finishing)} className="h-1.5" indicatorClassName={getAttributeColor(player.finishing)} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Passing</span>
            <span>{player.passing}/20</span>
          </div>
          <Progress value={toPercentage(player.passing)} className="h-1.5" indicatorClassName={getAttributeColor(player.passing)} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Dribbling</span>
            <span>{player.dribbling}/20</span>
          </div>
          <Progress value={toPercentage(player.dribbling)} className="h-1.5" indicatorClassName={getAttributeColor(player.dribbling)} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Defense</span>
            <span>{player.defense}/20</span>
          </div>
          <Progress value={toPercentage(player.defense)} className="h-1.5" indicatorClassName={getAttributeColor(player.defense)} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Heading</span>
            <span>{player.heading}/20</span>
          </div>
          <Progress value={toPercentage(player.heading)} className="h-1.5" indicatorClassName={getAttributeColor(player.heading)} />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground pt-1 flex justify-between">
        <span>Form: {player.form}</span>
        <span>Fitness: {player.fitness}%</span>
      </div>
    </div>
  );
};

export default PlayerDetails;
