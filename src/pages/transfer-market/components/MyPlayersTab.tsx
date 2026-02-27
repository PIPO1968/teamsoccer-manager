
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { ListPlayerDialog } from "./ListPlayerDialog";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { useUserTeam } from "@/hooks/useUserTeam";
import { MarketPlayer } from "../types";
import { formatMoney } from "../utils";

interface MyPlayersTabProps {
  searchTerm: string;
  positionFilter: string;
}

export const MyPlayersTab = ({ searchTerm, positionFilter }: MyPlayersTabProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<MarketPlayer | null>(null);
  const [isListingPlayer, setIsListingPlayer] = useState(false);
  const navigate = useNavigate();
  const { team } = useUserTeam();
  const { players: myPlayers, isLoading: playersLoading, refetch: refetchPlayers } = useTeamPlayers(team?.team_id?.toString());

  const filteredTeamPlayers = myPlayers?.filter(player => 
    player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (player.nationality || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getFormColor = (form: string) => {
    switch (form) {
      case "Excellent":
        return "bg-green-500 text-white";
      case "Good":
        return "bg-blue-500 text-white";
      case "Average":
        return "bg-yellow-500 text-black";
      case "Poor":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const viewPlayerDetails = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Squad</CardTitle>
        <CardDescription>List players for transfer or manage contracts</CardDescription>
      </CardHeader>
      <CardContent>
        {playersLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading your players...</span>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamPlayers.length > 0 ? (
                  filteredTeamPlayers.map(player => (
                    <TableRow key={player.player_id}>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/players/${player.player_id}`} className="hover:underline text-blue-600">
                          {player.first_name} {player.last_name}
                        </Link>
                      </TableCell>
                      <TableCell>{player.age}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{player.rating}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${getFormColor(player.form)}`}>
                          {player.form}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatMoney(player.value)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewPlayerDetails(player.player_id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer({
                                id: player.player_id,
                                name: `${player.first_name} ${player.last_name}`,
                                position: player.position,
                                age: player.age,
                                nationality: player.nationality || 'Unknown',
                                rating: player.rating,
                                form: player.form,
                                team: "",
                                askingPrice: 0,
                                listedSince: "",
                                player_id: player.player_id,
                                seller_team_id: team?.team_id,
                                deadline: "",
                                bidCount: 0,
                                value: player.value
                              });
                              setIsListingPlayer(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> List for Sale
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No players found in your squad
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedPlayer && (
        <ListPlayerDialog
          open={isListingPlayer}
          onOpenChange={setIsListingPlayer}
          player={selectedPlayer ? {
            id: selectedPlayer.id,
            name: selectedPlayer.name,
            position: selectedPlayer.position,
            rating: selectedPlayer.rating,
            value: selectedPlayer.value || 0
          } : null}
          onSuccess={() => {
            setIsListingPlayer(false);
            setSelectedPlayer(null);
            refetchPlayers();
          }}
        />
      )}
    </Card>
  );
};
