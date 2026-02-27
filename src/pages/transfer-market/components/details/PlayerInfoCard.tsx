
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";
import { MarketPlayer } from "../../types";
import { formatMoney } from "../../utils";

interface PlayerInfoCardProps {
  player: MarketPlayer;
}

export const PlayerInfoCard = ({ player }: PlayerInfoCardProps) => {
  const formatDeadline = () => {
    if (!player?.deadline) return 'Unknown';
    
    const deadline = new Date(player.deadline);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(deadline);
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 rounded-xl">
            <AvatarImage 
              src="/teamsoccer-assets/848f6751-dbc0-4a55-a9c5-b33f9ba442b2.png" 
              alt={player?.name || "Player"}
              className="object-cover w-full h-full rounded-xl"
            />
            <AvatarFallback className="rounded-xl">{player?.name?.charAt(0) || "P"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{player?.name || "Unknown Player"}</h3>
            <p className="text-muted-foreground">{player?.age || "N/A"} years old • {player?.nationality || "Unknown"}</p>
            <div className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{player?.team || "Free Agent"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md mb-4">
          <span className="text-sm font-medium">Rating</span>
          <span className="text-xl font-semibold">{player?.rating || "N/A"}</span>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Listing Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Starting Price:</span>
              <span className="font-medium">{formatMoney(player?.askingPrice || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Bid:</span>
              <span className="font-medium">
                {player?.highestBid ? formatMoney(player.highestBid) : "No bids"}
              </span>
            </div>
            <div className="flex justify-between items-center col-span-2">
              <span className="text-sm text-muted-foreground">Deadline:</span>
              <span className="text-sm">{formatDeadline()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
