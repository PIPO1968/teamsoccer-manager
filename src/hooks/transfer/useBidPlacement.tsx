
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";
import { useUserTeam } from "../useUserTeam";
import { BidOperationResult } from "./bidTypes";

export const useBidPlacement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { team } = useUserTeam();

  const placeBid = async (listingId: number, bidAmount: number): Promise<BidOperationResult> => {
    if (!team?.team_id) {
      toast.error("Team not found");
      return { success: false, message: "Team not found" };
    }

    if (!listingId) {
      toast.error("Invalid listing");
      return { success: false, message: "Invalid listing" };
    }

    setIsProcessing(true);
    try {
      await apiFetch(`/transfer-listings/${listingId}/bids`, {
        method: 'POST',
        body: JSON.stringify({ bidderTeamId: team.team_id, bidAmount }),
      });

      toast.success("Bid placed successfully");
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      console.error('Error placing bid:', error);
      // Surface server validation messages (e.g. bid too low)
      if (errorMessage.includes('mayor')) {
        toast.error("Your new bid must be higher than your current bid");
        return { success: false, message: "Your new bid must be higher than your current bid" };
      }
      toast.error(`Failed to place bid: ${errorMessage}`);
      return { success: false, message: `Failed to place bid: ${errorMessage}`, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    placeBid,
    isProcessing
  };
};
