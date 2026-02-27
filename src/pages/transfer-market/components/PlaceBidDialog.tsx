
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarketPlayer } from "../types";
import { Badge } from "@/components/ui/badge";
import { useBidOperations } from "@/hooks/transfer/useBidOperations";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { useUserTeam } from "@/hooks/useUserTeam";
import { formatMoney } from "../utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PlaceBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: MarketPlayer;
  onSuccess: () => void;
}

export const PlaceBidDialog = ({ open, onOpenChange, player, onSuccess }: PlaceBidDialogProps) => {
  const { placeBid, isProcessing } = useBidOperations();
  const { team } = useUserTeam();
  const { finances } = useTeamFinances(team?.team_id?.toString());
  
  const [bidAmount, setBidAmount] = useState<number>(
    player.highestBid ? player.highestBid + 10000 : player.askingPrice
  );
  
  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/,/g, ''));
    if (!isNaN(value)) {
      setBidAmount(value);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation checks
      if (!player.listing_id) {
        toast.error("Invalid listing");
        return;
      }

      // Check if bid is higher than current highest
      if (player.highestBid && bidAmount <= player.highestBid) {
        toast.error(`Bid must be higher than the current highest bid (${formatMoney(player.highestBid)})`);
        return;
      }

      // Check if bid is higher than starting price
      if (bidAmount < player.askingPrice) {
        toast.error(`Bid must be at least the starting price (${formatMoney(player.askingPrice)})`);
        return;
      }

      // Check if user has enough cash
      if (finances && bidAmount > finances.cash_balance) {
        toast.error(`You don't have enough cash (${formatMoney(finances.cash_balance)})`);
        return;
      }

      // Check if user is bidding on their own player
      if (player.seller_team_id === team?.team_id) {
        toast.error("You cannot bid on your own player");
        return;
      }

      console.log(`Submitting bid of ${bidAmount} for player ${player.name}, listing ID: ${player.listing_id}`);
      
      const result = await placeBid(player.listing_id, bidAmount);
      
      if (result.success) {
        console.log("Bid placed/updated successfully, closing dialog");
        toast.success("Bid placed successfully!");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error handling bid submission:", error);
      toast.error("An unexpected error occurred while placing your bid");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Place Bid on Player</DialogTitle>
          <DialogDescription>
            Enter your bid amount for {player.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="name">Player</Label>
            <div className="flex items-center gap-2">
              {player.name}
              <Badge variant="outline">{player.position}</Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="col-span-1">Rating</Label>
            <div className="col-span-1">{player.rating}</div>
            
            <Label htmlFor="age" className="col-span-1">Age</Label>
            <div className="col-span-1">{player.age}</div>
          </div>
          
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="starting-price">Starting Price</Label>
            <div>{formatMoney(player.askingPrice)}</div>
          </div>
          
          {player.highestBid && (
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="highest-bid">Current Highest Bid</Label>
              <div className="font-semibold">{formatMoney(player.highestBid)}</div>
            </div>
          )}
          
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="your-cash">Your Cash Balance</Label>
            <div>{finances ? formatMoney(finances.cash_balance) : "Loading..."}</div>
          </div>
          
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="bid-amount">Your Bid</Label>
            <Input
              id="bid-amount"
              type="text"
              value={bidAmount.toLocaleString()}
              onChange={handleBidAmountChange}
              className="font-medium text-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Place Bid"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
