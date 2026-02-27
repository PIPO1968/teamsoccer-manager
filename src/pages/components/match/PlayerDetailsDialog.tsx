
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, User, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface PlayerDetailsProps {
  playerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({ playerId, isOpen, onClose }) => {
  const [player, setPlayer] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!playerId || !isOpen) return;

    const fetchPlayerDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('players')
          .select(`
            *,
            team:teams!players_team_id_fkey (
              name,
              logo,
              primary_color
            )
          `)
          .eq('player_id', playerId)
          .single();
        
        if (error) throw error;
        setPlayer(data);
      } catch (err) {
        console.error("Error fetching player details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId, isOpen]);

  const toPercentage = (value: number) => (value / 20) * 100;

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
                    { label: "Pace", value: player.pace },
                    { label: "Finishing", value: player.finishing },
                    { label: "Passing", value: player.passing },
                    { label: "Dribbling", value: player.dribbling },
                    { label: "Defense", value: player.defense },
                    { label: "Heading", value: player.heading },
                    { label: "Stamina", value: player.stamina }
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-sm text-muted-foreground">{value}/20</span>
                      </div>
                      <Progress 
                        value={toPercentage(value)} 
                        className="h-2"
                        indicatorClassName={value >= 15 ? "bg-green-500" : value >= 10 ? "bg-yellow-500" : "bg-red-500"}
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
