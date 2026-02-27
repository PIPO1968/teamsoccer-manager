
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { getPositionColor } from "../utils/formationUtils";
import { cn } from "@/lib/utils";
import PlayerDetailsDialog from "./PlayerDetailsDialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InfoIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubstitutesViewProps {
  substitutes: PlayerData[];
  onSubstituteSelect: (player: PlayerData) => void;
  selectedPlayer: PlayerData | null;
}

const SubstitutesView: React.FC<SubstitutesViewProps> = ({ 
  substitutes, 
  onSubstituteSelect,
  selectedPlayer
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailPlayer, setDetailPlayer] = useState<PlayerData | null>(null);

  // Get player fitness as visual indicator
  const getFitnessIndicator = (fitness: number) => {
    const level = Math.min(5, Math.max(1, Math.ceil(fitness / 20)));
    return Array(level).fill('●').join('');
  };

  // Handle player detail view
  const handlePlayerClick = (player: PlayerData) => {
    setDetailPlayer(player);
    setIsDialogOpen(true);
  };

  // Handle position click for substitutes
  const handleSubstituteClick = (player: PlayerData) => {
    onSubstituteSelect(player);
  };

  // Group players by position type - safely handle undefined
  const getPositionType = (position: string): string => {
    if (position === "GK") return "Goalkeeper";
    if (["CB", "LB", "RB"].includes(position)) return "Defender";
    if (["CDM", "CM", "CAM", "LM", "RM"].includes(position)) return "Midfielder";
    if (["LW", "RW", "ST", "CF"].includes(position)) return "Forward";
    return "Other";
  };

  const positionGroups: {[key: string]: PlayerData[]} = {
    "Goalkeeper": [],
    "Defender": [],
    "Midfielder": [],
    "Forward": [],
    "Other": []
  };

  // Fixed: Add null check before accessing player.position
  substitutes.forEach(player => {
    if (player && player.position) {
      const posType = getPositionType(player.position);
      positionGroups[posType].push(player);
    } else {
      // Handle players with missing position info
      positionGroups["Other"].push(player);
    }
  });

  return (
    <Card className="bg-green-700 border-0">
      <div className="bg-green-600 text-white px-4 py-2 font-semibold flex justify-between items-center">
        <h3>Substitutes</h3>
        <InfoIcon className="h-5 w-5" />
      </div>
      <CardContent className="p-3 grid grid-cols-7 gap-1">
        {/* Position Headers */}
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Goalkeeper
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Central Defender
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Wing back
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Inner Midfielder
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Forward
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Winger
        </div>
        <div className="col-span-1 p-1 text-white text-center text-xs font-medium">
          Extra
        </div>
        
        {/* First row */}
        {[0, 1, 2, 3, 4, 5, 6].map((index) => {
          const positionMap = [
            positionGroups["Goalkeeper"][0],
            positionGroups["Defender"][0],
            positionGroups["Defender"][1],
            positionGroups["Midfielder"][0],
            positionGroups["Forward"][0],
            positionGroups["Forward"][1],
            positionGroups["Other"][0]
          ];
          const player = positionMap[index];
          
          return (
            <div key={index} className="col-span-1">
              <SubstitutePlayerCard 
                player={player} 
                onPlayerClick={handlePlayerClick}
                onPositionClick={player ? () => handleSubstituteClick(player) : undefined} 
                index={1}
                isSelected={player?.player_id === selectedPlayer?.player_id}
              />
            </div>
          );
        })}
        
        {/* Second row */}
        {[7, 8, 9, 10, 11, 12, 13].map((index) => {
          const positionMap = [
            positionGroups["Goalkeeper"][1],
            positionGroups["Defender"][2],
            positionGroups["Defender"][3],
            positionGroups["Midfielder"][1],
            positionGroups["Forward"][2],
            positionGroups["Forward"][3],
            positionGroups["Other"][1]
          ];
          const player = positionMap[index - 7];
          
          return (
            <div key={index} className="col-span-1">
              <SubstitutePlayerCard 
                player={player} 
                onPlayerClick={handlePlayerClick}
                onPositionClick={player ? () => handleSubstituteClick(player) : undefined} 
                index={2}
                isSelected={player?.player_id === selectedPlayer?.player_id}
              />
            </div>
          );
        })}
      </CardContent>

      <PlayerDetailsDialog 
        player={detailPlayer}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Card>
  );
};

interface SubstitutePlayerCardProps {
  player: PlayerData | undefined;
  onPlayerClick: (player: PlayerData) => void;
  onPositionClick?: () => void;
  index: number;
  isSelected: boolean;
}

const SubstitutePlayerCard: React.FC<SubstitutePlayerCardProps> = ({ 
  player, 
  onPlayerClick, 
  onPositionClick, 
  index,
  isSelected 
}) => {
  if (!player) {
    return (
      <div className="h-12 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-500">Empty</span>
      </div>
    );
  }

  const toPercentage = (value: number) => (value / 20) * 100;
  
  const getAttributeColor = (value: number) => {
    if (value >= 15) return "bg-green-500";
    if (value >= 10) return "bg-yellow-500";
    if (value >= 5) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          onClick={onPositionClick}
          className={cn(
            "h-12 rounded border-2 flex flex-col items-center justify-center cursor-pointer text-[10px] transition-all",
            isSelected ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-white hover:bg-gray-50"
          )}
        >
          <div className="font-semibold text-center leading-tight">
            {player.first_name.charAt(0)}.{player.last_name}
          </div>
          <div className="text-[8px] text-gray-600">
            {player.position} | {player.rating}
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
  );
};

export default SubstitutesView;
