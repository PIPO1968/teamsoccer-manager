
import { useState, useCallback, useEffect, useRef } from 'react';
import { apiFetch } from '@/services/apiClient';
import { MarketPlayer } from '../types';

export const useMarketListings = () => {
  const [marketPlayers, setMarketPlayers] = useState<MarketPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(true);
  const isFirstLoad = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchTransferListings = useCallback(async () => {
    if (fetchInProgress.current) return;

    fetchInProgress.current = true;

    try {
      if (!isMounted.current) return;

      const data = await apiFetch<{ success: boolean; listings: MarketPlayer[] }>(
        '/transfer-listings'
      );
      if (!isMounted.current) return;
      setMarketPlayers(data.listings || []);
    } catch (error) {
      console.error("Error fetching transfer listings:", error);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (isFirstLoad.current) {
      fetchTransferListings();
      isFirstLoad.current = false;
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchTransferListings]);

  return {
    marketPlayers,
    isLoading,
    refetch: fetchTransferListings
  };
};
