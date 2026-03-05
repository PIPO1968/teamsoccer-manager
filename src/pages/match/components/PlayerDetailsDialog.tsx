
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  if (!player) return null;

  // Convert player attribute (0-100) to visual percentage
  const toPercentage = (value: number) => value;

  // Get a color based on attribute value (0-100 scale)
  const getAttributeColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 45) return "bg-yellow-500";
    if (value >= 25) return "bg-orange-500";
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
              <div className="text-xs text-gray-500">{t('player.value')}</div>
              <div className="font-medium text-yellow-600">{formatValue(player.value)}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex-1">
              <div className="text-xs text-gray-500">{t('player.wage')}</div>
              <div className="font-medium">{formatWage(player.wage)}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex-1">
              <div className="text-xs text-gray-500">{t('player.fitness')}</div>
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
              {[
                { key: 'pace', value: player.pace },
                { key: 'finishing', value: player.finishing },
                { key: 'passing', value: player.passing },
                { key: 'dribbling', value: player.dribbling },
                { key: 'defense', value: player.defense },
                { key: 'heading', value: player.heading },
                { key: 'stamina', value: player.stamina },
                { key: 'goalkeeper', value: (player as any).goalkeeper ?? 0 },
              ].map(({ key, value }) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{t(`player.skill.${key}`)}</span>
                    <span className="text-xs">{value}</span>
                  </div>
                  <Progress value={toPercentage(value)} className="h-2"
                    indicatorClassName={getAttributeColor(value)} />
                </div>
              ))}
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
