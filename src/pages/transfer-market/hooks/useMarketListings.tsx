
import { useState, useCallback, useEffect, useRef } from 'react';
// import { supabase } from '@/integrations/supabase/client';
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

      // Llama a la API Express para obtener transferencias
      const response = await fetch('/api/transfer-listings');
      if (!response.ok) throw new Error('No se pudo obtener transferencias');
      const data = await response.json();
      if (!isMounted.current) return;
      setMarketPlayers(data.listings || []);
    } catch (error) {
      console.error("Error al obtener transferencias:", error);
    } finally {
      setIsLoading(false);
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
