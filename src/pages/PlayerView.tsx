
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerData } from "@/hooks/usePlayerData";
import PlayerStats from "./player/PlayerStats";
import PlayerTraits from "./player/PlayerTraits";
import { Flag } from "@/components/ui/flag";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ListPlayerDialog } from "./transfer-market/components/ListPlayerDialog";
import { useUserTeam } from "@/hooks/useUserTeam";
import { PlayerAvatar } from "@/components/avatar/PlayerAvatar";

const PlayerView = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { player, isLoading, error } = usePlayerData(playerId);
  const { team } = useUserTeam();
  const [isListPlayerDialogOpen, setIsListPlayerDialogOpen] = useState(false);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const isPlayerOnOwnTeam = player?.team_id === team?.team_id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-32 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Player Not Found</h2>
          <p className="mt-2 text-muted-foreground">Could not retrieve player data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <CardTitle className="text-base font-semibold">Player Info</CardTitle>
          {isPlayerOnOwnTeam && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsListPlayerDialogOpen(true)}
            >
              <Tag className="h-4 w-4 mr-1" />
              List for Transfer
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <PlayerAvatar 
              player={player} 
              size="lg" 
              className="w-24 h-24"
            />
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  {player.first_name} {player.last_name}
                  {player.nationality_id ? (
                    <Flag countryId={player.nationality_id} />
                  ) : (
                    player.nationality && <Flag country={player.nationality} />
                  )}
                </h2>
                <p className="text-lg text-muted-foreground">{player.position} | {player.age} years old</p>
                <div className="mt-2">
                  <PlayerTraits
                    personality={player.personality}
                    experience={player.experience}
                    leadership={player.leadership}
                    loyalty={player.loyalty}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Nationality:</span>
                  <span>{player.nationality || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Value:</span>
                  <span>{formatValue(player.value)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Wage:</span>
                  <span>{formatValue(player.wage)}/week</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Fitness:</span>
                  <span>{player.fitness}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Matches:</span>
                  <span>{player.matches_played}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Form:</span>
                  <Badge variant="secondary">{player.form}</Badge>
                </div>
              </div>

              {player.team_id && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Owner: </span>
                  <Link 
                    to={`/team/${player.team_id}`} 
                    className="text-sm text-primary hover:underline"
                  >
                    {player.team?.name || "Unknown Team"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <PlayerStats 
        stats={{
          finishing: player.finishing,
          pace: player.pace,
          passing: player.passing,
          defense: player.defense,
          dribbling: player.dribbling,
          heading: player.heading,
          stamina: player.stamina
        }}
      />

      {isPlayerOnOwnTeam && (
        <ListPlayerDialog
          open={isListPlayerDialogOpen}
          onOpenChange={setIsListPlayerDialogOpen}
          player={{
            id: player.player_id,
            name: `${player.first_name} ${player.last_name}`,
            position: player.position, 
            rating: player.rating,
            value: player.value
          }}
        />
      )}
    </div>
  );
};

export default PlayerView;
