
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, User, Flag } from "lucide-react";
import { apiFetch } from "@/services/apiClient";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlayerDetailsProps {
  playerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playerId, isOpen, onClose }) => {
  const [player, setPlayer] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!playerId || !isOpen) return;

    const fetchPlayerDetails = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<{ success: boolean; player: any }>(
          `/players/${playerId}`
        );
        setPlayer(data.player);
      } catch (err) {
        console.error("Error fetching player details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId, isOpen]);

  const toPercentage = (value: number) => value;

  const getAttributeColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 45) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[300]">
        <DialogHeader className="bg-green-600 text-white p-4 flex items-center">
          <div className="w-10 h-10 bg-white rounded-md mr-3 flex items-center justify-center">
            <User size={24} className="text-green-600" />
          </div>
          <DialogTitle className="text-xl">{player ? `${player.first_name} ${player.last_name}` : 'Player'}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 text-center">Loading player data...</div>
        ) : player ? (
          <div className="divide-y">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-green-700">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-gray-600">{player.age} years old</p>
                  <div className="flex items-center mt-1">
                    <Flag size={16} className="mr-1 text-gray-500" />
                    <span>{player.nationality}</span>
                  </div>
                </div>
                {player.team && (
                  <div className="text-right">
                    <p className="font-medium">Owner</p>
                    <p className="text-sm text-gray-600">{player.team.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-4">
                  {[
                    { key: "pace", value: player.pace },
                    { key: "finishing", value: player.finishing },
                    { key: "passing", value: player.passing },
                    { key: "dribbling", value: player.dribbling },
                    { key: "defense", value: player.defense },
                    { key: "heading", value: player.heading },
                    { key: "stamina", value: player.stamina },
                    { key: "goalkeeper", value: player.goalkeeper ?? 0 },
                  ].map(({ key, value }) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{t(`player.skill.${key}`)}</span>
                        <span className="text-sm text-muted-foreground">{value}</span>
                      </div>
                      <Progress
                        value={toPercentage(value)}
                        className="h-2"
                        indicatorClassName={getAttributeColor(value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            Player information not available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerDetails;
