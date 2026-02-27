
import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketPlayer } from '../types';
import { useUserTeam } from '@/hooks/useUserTeam';
import { useBidOperations } from '@/hooks/transfer/useBidOperations';

export const useMarketListings = () => {
  const [marketPlayers, setMarketPlayers] = useState<MarketPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { team } = useUserTeam();
  const { getHighestBid } = useBidOperations();
  
  // Use refs to track component mount state and prevent memory leaks
  const isMounted = useRef(true);
  const isFirstLoad = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchTransferListings = useCallback(async () => {
    // Prevent concurrent fetch operations
    if (fetchInProgress.current) {
      console.log("Transfer listing fetch already in progress, skipping");
      return;
    }
    
    fetchInProgress.current = true;
    console.log("Starting transfer listings fetch");
    
    try {
      if (!isMounted.current) {
        console.log("Component unmounted during fetch preparation, aborting");
        return;
      }
      
      console.log("Fetching transfer listings");
      
      const { data, error } = await supabase
        .from('transfer_listings')
        .select(`
          id,
          player_id,
          asking_price,
          seller_team_id,
          is_active,
          deadline,
          bids,
          players (
            player_id,
            first_name,
            last_name,
            age,
            nationality_id,
            position,
            rating,
            form,
            finishing,
            pace,
            passing,
            defense,
            dribbling,
            heading,
            stamina,
            leagues_regions:nationality_id (name)
          ),
          teams!transfer_listings_seller_team_id_fkey (
            name,
            club_logo
          )
        `)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching transfer listings:', error);
        if (isMounted.current) {
          setMarketPlayers([]);
          setIsLoading(false);
        }
        return;
      }
      
      console.log(`Transfer listings fetched: ${data?.length || 0}`);
      
      if (!isMounted.current) {
        console.log("Component unmounted after fetch, aborting data processing");
        return;
      }
      
      if (data && data.length > 0) {
        // Process each listing and fetch the highest bid information
        const playerPromises = data.map(async item => {
          const player = item.players;
          const sellerTeam = item.teams;
          
          if (!player || !isMounted.current) {
            return null;
          }
          
          let highestBid = 0;
          let isUserBid = false;
          
          // Always check for bids regardless of the bids count
          // This ensures we catch any newly placed bids
          try {
            console.log(`Checking bids for listing ${item.id}`);
            const bidInfo = await getHighestBid(item.id);
            if (bidInfo) {
              highestBid = bidInfo.amount || 0;
              isUserBid = bidInfo.isUserBid || false;
              console.log(`Highest bid for ${item.id}: ${highestBid}, isUserBid: ${isUserBid}`);
            }
          } catch (err) {
            console.error(`Error getting highest bid for listing ${item.id}:`, err);
          }
          
          return {
            id: player.player_id,
            name: `${player.first_name} ${player.last_name}`,
            position: player.position || 'Unknown',
            age: player.age || 0,
            nationality: player.leagues_regions?.name || 'Unknown',
            rating: player.rating || 0,
            form: player.form || 'Average',
            team: sellerTeam?.name || 'Free Agent',
            askingPrice: item.asking_price || 0,
            listedSince: item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Unknown',
            deadline: item.deadline,
            listing_id: item.id,
            player_id: item.player_id,
            seller_team_id: item.seller_team_id,
            bidCount: item.bids || 0,
            highestBid: highestBid > 0 ? highestBid : undefined,
            userHasHighestBid: isUserBid,
            value: 0,
            stats: {
              finishing: player.finishing || 0,
              pace: player.pace || 0,
              passing: player.passing || 0,
              defense: player.defense || 0,
              dribbling: player.dribbling || 0,
              heading: player.heading || 0,
              stamina: player.stamina || 0
            }
          };
        });
        
        try {
          console.log("Processing player results");
          const playerResults = await Promise.all(playerPromises);
          
          if (isMounted.current) {
            // Filter out null values (in case of errors during mapping)
            const validData = playerResults.filter(Boolean) as MarketPlayer[];
            console.log(`Processed market players: ${validData.length}`);
            setMarketPlayers(validData);
            setIsLoading(false);
          } else {
            console.log("Component unmounted during player processing, skipping state update");
          }
        } catch (err) {
          console.error('Error processing players:', err);
          if (isMounted.current) {
            setMarketPlayers([]);
            setIsLoading(false);
          }
        }
      } else {
        if (isMounted.current) {
          console.log("No transfer listings found");
          setMarketPlayers([]);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Error processing transfer listings:', err);
      if (isMounted.current) {
        setMarketPlayers([]);
        setIsLoading(false);
      }
    } finally {
      fetchInProgress.current = false;
      console.log("Transfer listing fetch completed");
    }
  }, [getHighestBid]);

  useEffect(() => {
    // Reset mount state on component mount
    console.log("Market listings hook initialized");
    isMounted.current = true;
    
    // Only fetch on first load
    if (isFirstLoad.current) {
      console.log("First load detected, fetching transfer listings");
      fetchTransferListings();
      isFirstLoad.current = false;
    } else {
      console.log("Not first load, skipping initial fetch");
    }
    
    // Cleanup on unmount
    return () => {
      console.log("Market listings hook unmounted");
      isMounted.current = false;
    };
  }, [fetchTransferListings]);

  return {
    marketPlayers,
    isLoading,
    refetch: fetchTransferListings
  };
};
