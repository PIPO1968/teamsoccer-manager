
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerData } from '@/hooks/useTeamPlayers';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { generatePersonalityDescription } from "@/utils/playerTraits";

interface PlayerDetailsDialogProps {
  player: PlayerData | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = ({ 
  player, 
  isOpen, 
  onClose 
}) => {
  if (!player) return null;

  // Convert player attribute to a visual percentage
  const toPercentage = (value: number) => (value / 20) * 100;
  
  // Get a color based on attribute value
  const getAttributeColor = (value: number) => {
    if (value >= 15) return "bg-green-500";
    if (value >= 10) return "bg-yellow-500";
    if (value >= 5) return "bg-orange-500";
    return "bg-red-500";
  };

  // Format player value to display as millions
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };
  
  // Format player wage to display as thousands per week
  const formatWage = (wage: number) => {
    return `$${(wage / 1000).toFixed(0)}K/week`;
  };

  const personalityDescription = generatePersonalityDescription(
    player.personality,
    player.experience,
    player.leadership,
    player.loyalty
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[300]">
        <DialogHeader className={`p-4 text-white rounded-t-lg`} style={{ backgroundColor: "#2e7d32" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white text-green-800">{player.position}</Badge>
                <DialogTitle className="text-xl">
                  {player.first_name} {player.last_name}
                </DialogTitle>
              </div>
              <div className="text-sm mt-1 flex items-center gap-2">
                <span>{player.nationality || 'Unknown'}</span>
                <span>•</span>
                <span>{player.age} years</span>
              </div>
            </div>
            <div className="bg-white text-green-800 h-8 w-8 flex items-center justify-center rounded-full font-bold">
              {player.rating}
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 rounded-lg p-3 flex-1">
              <div className="text-xs text-gray-500">Value</div>
              <div className="font-medium text-yellow-600">{formatValue(player.value)}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex-1">
              <div className="text-xs text-gray-500">Wage</div>
              <div className="font-medium">{formatWage(player.wage)}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex-1">
              <div className="text-xs text-gray-500">Fitness</div>
              <div className="font-medium">
                <Badge variant={player.fitness >= 90 ? "default" : player.fitness >= 70 ? "secondary" : "destructive"}>
                  {player.fitness}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{personalityDescription}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Attributes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pace</span>
                  <span className="text-xs">{player.pace}/20</span>
                </div>
                <Progress value={toPercentage(player.pace)} className="h-2" 
                  indicatorClassName={getAttributeColor(player.pace)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Finishing</span>
                  <span className="text-xs">{player.finishing}/20</span>
                </div>
                <Progress value={toPercentage(player.finishing)} className="h-2"
                  indicatorClassName={getAttributeColor(player.finishing)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Passing</span>
                  <span className="text-xs">{player.passing}/20</span>
                </div>
                <Progress value={toPercentage(player.passing)} className="h-2"
                  indicatorClassName={getAttributeColor(player.passing)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Dribbling</span>
                  <span className="text-xs">{player.dribbling}/20</span>
                </div>
                <Progress value={toPercentage(player.dribbling)} className="h-2"
                  indicatorClassName={getAttributeColor(player.dribbling)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Defense</span>
                  <span className="text-xs">{player.defense}/20</span>
                </div>
                <Progress value={toPercentage(player.defense)} className="h-2"
                  indicatorClassName={getAttributeColor(player.defense)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Heading</span>
                  <span className="text-xs">{player.heading}/20</span>
                </div>
                <Progress value={toPercentage(player.heading)} className="h-2"
                  indicatorClassName={getAttributeColor(player.heading)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Stamina</span>
                  <span className="text-xs">{player.stamina}/20</span>
                </div>
                <Progress value={toPercentage(player.stamina)} className="h-2"
                  indicatorClassName={getAttributeColor(player.stamina)} />
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500 flex justify-between">
            <p>Contract until: {new Date(player.contract_until).toLocaleDateString()}</p>
            <p>Form: {player.form}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDetailsDialog;
