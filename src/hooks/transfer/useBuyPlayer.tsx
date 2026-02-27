import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserTeam } from "../useUserTeam";
import { useFinanceOperations } from "./useFinanceOperations";
import { usePlayerOperations } from "./usePlayerOperations";

export const useBuyPlayer = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { team } = useUserTeam();
  const { updateTeamFinancesForPurchase, updateTeamFinancesForSale } = useFinanceOperations();
  const { updatePlayerTeam, deactivatePlayerListings } = usePlayerOperations();

  const buyPlayer = async (listingId: number | object, playerId: number, sellerTeamId: number | null) => {
    if (!team?.team_id) {
      toast.error("Team not found");
      return false;
    }

    setIsProcessing(true);
    try {
      // Determine pricing info from listing
      let askingPrice;
      let specificListingId: number | null = null;
      
      if (typeof listingId === 'object' && listingId !== null && 'askingPrice' in listingId) {
        askingPrice = (listingId as any).askingPrice;
      } else if (typeof listingId === 'number') {
        specificListingId = listingId;
        const { data: listing, error: listingError } = await supabase
          .from('transfer_listings')
          .select('asking_price')
          .eq('id', listingId)
          .maybeSingle();

        if (listingError) throw listingError;
        if (!listing) throw new Error("Listing not found");
        
        askingPrice = listing.asking_price;
      } else {
        throw new Error("Invalid listing ID");
      }

      console.log(`Starting transfer process for player ID: ${playerId}`);
      
      // Deactivate the specific listing if we have its ID
      if (specificListingId) {
        console.log(`Deactivating listing ID: ${specificListingId}`);
        
        // First, check if the listing exists and is active
        const { data: listingCheck, error: checkError } = await supabase
          .from('transfer_listings')
          .select('id')
          .eq('id', specificListingId)
          .eq('is_active', true);
          
        if (checkError) {
          console.error(`Error checking listing ${specificListingId}:`, checkError);
          throw checkError;
        }
        
        const exists = listingCheck && listingCheck.length > 0;
        
        if (exists) {
          const { error: updateError } = await supabase
            .from('transfer_listings')
            .update({ is_active: false })
            .eq('id', specificListingId);
            
          if (updateError) {
            console.error(`Error deactivating listing ${specificListingId}:`, updateError);
            throw updateError;
          }
          
          console.log(`Deactivated listing with ID ${specificListingId}`);
        } else {
          console.log(`No active listing found with ID ${specificListingId}`);
        }
      }
      
      // Also deactivate all listings for this player as a backup
      const deactivatedCount = await deactivatePlayerListings(playerId);
      console.log(`Backup deactivation affected ${deactivatedCount} additional listings`);
      
      // Update the player's team
      await updatePlayerTeam(playerId, team.team_id);

      // Update finances if this is not a free agent
      if (sellerTeamId) {
        await updateTeamFinancesForPurchase(team.team_id, askingPrice);
        await updateTeamFinancesForSale(sellerTeamId, askingPrice);
      } else {
        console.log("Free agent transfer - no financial transaction needed");
        await updateTeamFinancesForPurchase(team.team_id, askingPrice);
      }

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
