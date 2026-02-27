
import React from 'react';
import { PlayerData } from '@/hooks/useTeamPlayers';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getPositionColor } from '../utils/formationUtils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from '@/components/ui/progress';
import { PlayerAvatar } from "@/components/avatar/PlayerAvatar";

interface PlayersListProps {
  players: PlayerData[];
  selectedPlayers: { [key: string]: PlayerData };
  onPlayerSelect: (player: PlayerData) => void;
  selectedPlayer: PlayerData | null;
}

const PlayersList: React.FC<PlayersListProps> = ({ 
  players, 
  selectedPlayers,
  onPlayerSelect,
  selectedPlayer
}) => {
  // Check if player is already in the lineup
  const isPlayerSelected = (player: PlayerData) => {
    return Object.values(selectedPlayers).some(p => p?.player_id === player.player_id);
  };
  
  // Get player fitness as visual indicator
  const getFitnessIndicator = (fitness: number) => {
    const level = Math.min(5, Math.max(1, Math.ceil(fitness / 20)));
    return Array(level).fill('●').join('');
  };

  // Calculate attribute percentages for progress bars
  const toPercentage = (value: number) => (value / 20) * 100;
  
  // Get color based on attribute value
  const getAttributeColor = (value: number) => {
    if (value >= 15) return "bg-green-500";
    if (value >= 10) return "bg-yellow-500";
    if (value >= 5) return "bg-orange-500";
    return "bg-red-500";
  };

  // Sort players by rating (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
  
  return (
    <div className="space-y-1 max-h-[500px] overflow-y-auto">
      <div className="space-y-1">
        {sortedPlayers.map((player) => (
          <HoverCard key={player.player_id}>
            <HoverCardTrigger asChild>
              <div 
                onClick={() => onPlayerSelect(player)}
                className={cn(
                  "p-2 rounded-md flex items-center justify-between cursor-pointer transition-colors",
                  isPlayerSelected(player) ? "bg-primary/10 border border-primary/30" : "hover:bg-accent",
                  selectedPlayer?.player_id === player.player_id ? "bg-primary/20 border-2 border-primary" : ""
                )}
              >
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <PlayerAvatar 
                      player={player} 
                      size="sm" 
                      className="w-8 h-8"
                    />
                    <Badge className="absolute -bottom-1 -right-1 h-4 w-auto px-1 text-[10px]">
                      {player.position}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {player.first_name} {player.last_name}
                      {isPlayerSelected(player) && <span className="text-primary ml-2">✓</span>}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{player.rating} OVR</span>
                      <span className="mx-1">•</span>
                      <span className="text-yellow-500">{getFitnessIndicator(player.fitness)}</span>
                      <span className="mx-1">•</span>
                      <span>{player.form}</span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 z-[100]">
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
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
};

export default PlayersList;
