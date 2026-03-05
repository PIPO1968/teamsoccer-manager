
import { useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "sonner";
import { useUserTeam } from "../useUserTeam";

export const useListingOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { team } = useUserTeam();

  const listPlayerForSale = async (playerId: number, askingPrice: number) => {
    if (!team?.team_id) {
      toast.error("Team not found");
      return false;
    }

    setIsProcessing(true);
    try {
      await apiFetch('/transfer-listings', {
        method: 'POST',
        body: JSON.stringify({
          player_id: playerId,
          asking_price: askingPrice,
          seller_team_id: team.team_id,
        }),
      });

      toast.success("Player listed for transfer");
      return true;
    } catch (error) {
      console.error('Error listing player:', error);
      toast.error("Failed to list player for transfer");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    listPlayerForSale,
    isProcessing
  };
};
