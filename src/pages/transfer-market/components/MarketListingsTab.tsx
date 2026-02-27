
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PackagePlus, Timer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useTransferListingsSeeder } from "@/hooks/useTransferListingsSeeder";
import { MarketPlayer } from "../types";
import { useMarketListings } from "../hooks/useMarketListings";
import { formatMoney } from "../utils";
import { PlaceBidDialog } from "./PlaceBidDialog";
import { ListingDetailsDialog } from "./ListingDetailsDialog";
import { useBidOperations } from "@/hooks/transfer/useBidOperations";

interface MarketListingsTabProps {
  searchTerm: string;
  positionFilter: string;
}

export const MarketListingsTab = ({ searchTerm, positionFilter }: MarketListingsTabProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<MarketPlayer | null>(null);
  const [isBiddingPlayer, setIsBiddingPlayer] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const navigate = useNavigate();
  const { seedTransferListings, isSeeding } = useTransferListingsSeeder();
  const { marketPlayers, isLoading, refetch } = useMarketListings();
  const { getHighestBid } = useBidOperations();

  const filteredMarketPlayers = marketPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.team.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    
    return matchesSearch && matchesPosition;
  });

  const viewPlayerDetails = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes}m`;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transfer Market</CardTitle>
          <CardDescription>Players currently available for transfer</CardDescription>
        </div>
        <Button 
          variant="outline" 
          onClick={seedTransferListings} 
          disabled={isSeeding}
          className="ml-auto flex items-center"
        >
          {isSeeding ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PackagePlus className="h-4 w-4 mr-2" />
          )}
          Add Players to Market
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading transfer listings...</span>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarketPlayers.length > 0 ? (
                  filteredMarketPlayers.map(player => (
                    <TableRow key={`${player.id}-${player.listing_id || 'mock'}`}>
                      <TableCell>
                        <Badge variant="outline">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link to={`/players/${player.id}`} className="hover:underline text-blue-600">
                          {player.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{player.rating}</span>
                        <span className="text-xs text-muted-foreground ml-1">({player.age})</span>
                      </TableCell>
                      <TableCell>{player.team}</TableCell>
                      <TableCell className="font-medium">
                        {formatMoney(player.askingPrice)}
                      </TableCell>
                      <TableCell>
                        {player.highestBid ? (
                          <span className={`font-semibold ${player.userHasHighestBid ? "text-green-600" : "text-amber-600"}`}>
                            {formatMoney(player.highestBid)}
                            {player.userHasHighestBid && " (You)"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No bids</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center">
                          <Timer className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className={new Date(player.deadline) < new Date() ? "text-red-500" : ""}>
                            {formatDeadline(player.deadline)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsViewingDetails(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setIsBiddingPlayer(true);
                            }}
                          >
                            Place Bid
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No players found matching your criteria. Click &quot;Add Players to Market&quot; to add some.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedPlayer && (
        <>
          <PlaceBidDialog
            open={isBiddingPlayer}
            onOpenChange={setIsBiddingPlayer}
            player={selectedPlayer}
            onSuccess={() => {
              setIsBiddingPlayer(false);
              refetch();
            }}
          />

          <ListingDetailsDialog
            open={isViewingDetails}
            onOpenChange={setIsViewingDetails}
            player={selectedPlayer}
          />
        </>
      )}
    </Card>
  );
};
