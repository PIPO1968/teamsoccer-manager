
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserTeam } from "../../useUserTeam";
import { PlayerBid } from "@/pages/transfer-market/types";
import { createBidError } from "../bidTypes";

export const useUserBidsQuery = () => {
  const { team } = useUserTeam();

  const getUserBids = async (): Promise<PlayerBid[]> => {
    if (!team?.team_id) {
      console.log("No team found for user bids");
      return [];
    }

    try {
      console.log("Fetching user bids for team ID:", team.team_id);
      // First, get the basic bid information
      const { data: bidsData, error: bidsError } = await supabase
        .from('transfer_bids')
        .select(`
          id,
          transfer_listing_id,
          bidder_team_id,
          bid_amount,
          status,
          created_at
        `)
        .eq('bidder_team_id', team.team_id)
        .order('created_at', { ascending: false });

      if (bidsError) {
        console.error('Error fetching user bids:', bidsError);
        throw createBidError(
          bidsError.message || "Failed to fetch user bids", 
          "get_user_bids", 
          { teamId: team.team_id }
        );
      }

      // If there are no bids, return empty array
      if (!bidsData || bidsData.length === 0) {
        console.log("No bids found for team ID:", team.team_id);
        return [];
      }

      console.log(`Found ${bidsData.length} bids for team ID: ${team.team_id}`);
      
      // Create a map to store player and listing details
      const enrichedBids: PlayerBid[] = [];
      
      // Process each bid to fetch additional data
      for (const bid of bidsData) {
        try {
          // For each bid, get the listing details
          if (bid.transfer_listing_id) {
            // Get listing information
            const { data: listingData, error: listingError } = await supabase
              .from('transfer_listings')
              .select(`
                player_id,
                is_active,
                deadline,
                seller_team_id
              `)
              .eq('id', bid.transfer_listing_id)
              .single();

            if (listingError) {
              console.warn(`Error fetching listing data for listing ID ${bid.transfer_listing_id}:`, listingError);
              continue; // Skip to next bid if we can't get listing data
            }
            
            // If we have listing data with player ID, get player details
            let playerName = "Unknown Player";
            let playerData = null;
            
            if (listingData?.player_id) {
              const { data: player, error: playerError } = await supabase
                .from('players')
                .select('first_name, last_name')
                .eq('player_id', listingData.player_id)
                .single();
                
              if (playerError) {
                console.warn(`Error fetching player data for player ID ${listingData.player_id}:`, playerError);
              } else if (player) {
                playerName = `${player.first_name} ${player.last_name}`;
                playerData = player;
              }
            }
            
            // Get bidder team name
            const { data: bidderTeam, error: bidderTeamError } = await supabase
              .from('teams')
              .select('name')
              .eq('team_id', bid.bidder_team_id)
              .single();

            if (bidderTeamError) {
              console.warn(`Could not find team name for team ID ${bid.bidder_team_id}`);
            }

            // Get seller team name if available - make sure we actually have a valid seller_team_id
            let sellerTeamName = "Unknown Team";
            
            if (listingData?.seller_team_id) {
              console.log(`Fetching seller team name for team ID: ${listingData.seller_team_id}`);
              const { data: sellerTeam, error: sellerTeamError } = await supabase
                .from('teams')
                .select('name')
                .eq('team_id', listingData.seller_team_id)
                .single();
                
              if (sellerTeamError) {
                console.warn(`Could not find seller team name for team ID ${listingData.seller_team_id}:`, sellerTeamError);
              } else if (sellerTeam && sellerTeam.name) {
                sellerTeamName = sellerTeam.name;
                console.log(`Found seller team name: ${sellerTeamName} for team ID: ${listingData.seller_team_id}`);
              }
            }

            // Build the enriched bid object
            enrichedBids.push({
              id: Number(bid.id) || 0,
              transfer_listing_id: bid.transfer_listing_id || 0,
              bidder_team_id: bid.bidder_team_id || 0,
              bidder_name: bidderTeam?.name || team?.name || "Unknown",
              bid_amount: bid.bid_amount || 0,
              status: (bid.status || 'pending') as 'pending' | 'accepted' | 'rejected' | 'outbid',
              created_at: bid.created_at || new Date().toISOString(),
              // Extract player and listing details
              player_id: listingData?.player_id || 0,
              player_name: playerName,
              deadline: listingData?.deadline || null,
              is_active: listingData?.is_active || false,
              // Include seller team info
              seller_team_id: listingData?.seller_team_id || 0,
              seller_team_name: sellerTeamName
            });
          } else {
            // Handle bids without listing ID
            enrichedBids.push({
              id: Number(bid.id) || 0,
              transfer_listing_id: 0,
              bidder_team_id: bid.bidder_team_id || 0,
              bidder_name: team?.name || "Unknown",
              bid_amount: bid.bid_amount || 0,
              status: (bid.status || 'pending') as 'pending' | 'accepted' | 'rejected' | 'outbid',
              created_at: bid.created_at || new Date().toISOString(),
              seller_team_name: "Unknown Team"
            });
          }
        } catch (err) {
          console.error(`Error processing bid ID ${bid.id}:`, err);
        }
      }
      
      console.log(`Processed ${enrichedBids.length} enriched bids`);
      return enrichedBids;
    } catch (error) {
      console.error('Error in getUserBids:', error);
      return [];
    }
  };

  return {
    getUserBids
  };
};
