
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";
import { useUserTeam } from "../useUserTeam";

export const useBuyPlayer = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { team } = useUserTeam();

  const buyPlayer = async (listingId: number | object, playerId: number, sellerTeamId: number | null) => {
    if (!team?.team_id) {
      toast.error("Team not found");
      return false;
    }

    let numericListingId: number | null = null;
    if (typeof listingId === 'number') {
      numericListingId = listingId;
    } else if (typeof listingId === 'object' && listingId !== null && 'id' in listingId) {
      numericListingId = (listingId as any).id;
    }

    if (!numericListingId) {
      toast.error("Invalid listing");
      return false;
    }

    setIsProcessing(true);
    try {
      await apiFetch(`/transfer-listings/${numericListingId}/buy`, {
        method: 'POST',
        body: JSON.stringify({ buyerTeamId: team.team_id }),
      });

      toast.success("Transfer completed successfully");
      return true;
    } catch (error) {
      console.error('Error completing transfer:', error);
      toast.error("Failed to complete transfer");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    buyPlayer,
    isProcessing
  };
};
