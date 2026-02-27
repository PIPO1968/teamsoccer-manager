
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserTeam } from "../useUserTeam";
import { BidOperationResult, createBidError } from "./bidTypes";

export const useBidPlacement = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { team } = useUserTeam();

  const placeBid = async (listingId: number, bidAmount: number): Promise<BidOperationResult> => {
    if (!team?.team_id) {
      console.error("Team not found for bid placement");
      toast.error("Team not found");
      return { success: false, message: "Team not found" };
    }

    if (!listingId) {
      console.error("Invalid listing ID provided");
      toast.error("Invalid listing");
      return { success: false, message: "Invalid listing" };
    }

    setIsProcessing(true);
    try {
      console.log(`Attempting to place bid of ${bidAmount} on listing ${listingId}`);
      
      // Check if user already has a bid on this listing
      const { data: existingBid, error: queryError } = await supabase
        .from('transfer_bids')
        .select('id, bid_amount')
        .eq('transfer_listing_id', listingId)
        .eq('bidder_team_id', team.team_id)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (queryError) {
        console.error('Error checking for existing bid:', queryError);
        toast.error("Failed to check existing bids");
        throw createBidError(
          queryError.message || "Failed to check existing bids", 
          "check_existing_bid", 
          { listingId, teamId: team.team_id }
        );
      }

      // Handle bid placement logic based on whether it's an update or new bid
      if (existingBid) {
        return await handleExistingBid(existingBid, bidAmount, listingId);
      } else {
        return await createNewBid(listingId, team.team_id, bidAmount);
      }
    } catch (error: any) {
      console.error('Error in placeBid function:', error);
      const errorMessage = error?.message || "Unknown error";
      toast.error(`Failed to place bid: ${errorMessage}`);
      return { 
        success: false, 
        message: `Failed to place bid: ${errorMessage}`,
        error 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExistingBid = async (
    existingBid: { id: number | null; bid_amount: number }, 
    bidAmount: number,
    listingId: number
  ): Promise<BidOperationResult> => {
    console.log(`Found existing bid: ${JSON.stringify(existingBid)}`);
    
    if (existingBid.bid_amount >= bidAmount) {
      toast.error("Your new bid must be higher than your current bid");
      return { 
        success: false, 
        message: "Your new bid must be higher than your current bid" 
      };
    }
    
    // Make sure we have a valid bid ID
    if (!existingBid.id) {
      console.error('Invalid existing bid ID:', existingBid);
      toast.error("Could not update bid: Invalid bid ID");
      return { 
        success: false, 
        message: "Could not update bid: Invalid bid ID" 
      };
    }
    
    console.log(`Updating existing bid ID: ${existingBid.id} with new amount: ${bidAmount}`);
    
    // Use explicit where clause with bid ID
    const { error: updateError } = await supabase
      .from('transfer_bids')
      .update({
        bid_amount: bidAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingBid.id);

    if (updateError) {
      console.error('Error updating bid:', updateError);
      toast.error(`Failed to update bid: ${updateError.message || "Unknown error"}`);
      throw createBidError(
        updateError.message || "Failed to update bid", 
        "update_bid", 
        { bidId: existingBid.id, bidAmount }
      );
    }
    
    // Update the bids count on the listing
    await updateListingBidCount(listingId);
    
    console.log('Bid updated successfully');
    toast.success("Bid updated successfully");
    return { success: true };
  };

  const createNewBid = async (
    listingId: number, 
    teamId: number, 
    bidAmount: number
  ): Promise<BidOperationResult> => {
    console.log(`Creating new bid for listing ${listingId}`);
    
    const { error: insertError } = await supabase
      .from('transfer_bids')
      .insert({
        transfer_listing_id: listingId,
        bidder_team_id: teamId,
        bid_amount: bidAmount,
        status: 'pending'
      });

    if (insertError) {
      console.error('Error creating new bid:', insertError);
      toast.error(`Failed to place bid: ${insertError.message || "Unknown error"}`);
      throw createBidError(
        insertError.message || "Failed to place bid", 
        "create_bid", 
        { listingId, teamId, bidAmount }
      );
    }
    
    // Update the bids count on the listing
    await updateListingBidCount(listingId);
    
    console.log('Bid placed successfully');
    toast.success("Bid placed successfully");
    return { success: true };
  };
  
  // Helper function to update the bid count on a listing
  const updateListingBidCount = async (listingId: number) => {
    try {
      // Count the number of bids for this listing
      const { error: countError, count } = await supabase
        .from('transfer_bids')
        .select('id', { count: 'exact' })
        .eq('transfer_listing_id', listingId);
        
      if (countError) {
        console.error('Error counting bids:', countError);
        return;
      }
      
      // Use the count property correctly from the Supabase response
      const bidCount = count || 0;
      console.log(`Counted ${bidCount} bids for listing ${listingId}`);
      
      // Update the listing with the new count
      const { error: updateError } = await supabase
        .from('transfer_listings')
        .update({ bids: bidCount })
        .eq('id', listingId);
        
      if (updateError) {
        console.error('Error updating listing bid count:', updateError);
      } else {
        console.log(`Updated listing ${listingId} bid count to ${bidCount}`);
      }
    } catch (error) {
      console.error('Error updating bid count:', error);
    }
  };
  
  return {
    placeBid,
    isProcessing
  };
};
