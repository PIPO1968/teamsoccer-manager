
import { useState, useCallback, useEffect, useRef } from "react";
import { PlayerBid } from "@/pages/transfer-market/types";
import { useBidOperations } from "./useBidOperations";
import { useToast } from "@/hooks/use-toast";
import { useUserTeam } from "@/hooks/useUserTeam";

export const useFetchUserBids = () => {
  const [userBids, setUserBids] = useState<PlayerBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserBids } = useBidOperations();
  const { team, isLoading: isTeamLoading } = useUserTeam();
  const { toast } = useToast();

  // Use refs to track component mount state and prevent memory leaks
  const isMounted = useRef(true);
  const isFirstLoad = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchUserBids = useCallback(async (showToast = false) => {
    // Don't attempt to fetch if the team data isn't loaded yet
    if (isTeamLoading) {
      console.log("Team data still loading, waiting before fetching bids");
      return;
    }

    // Ensure we have team data before attempting to fetch bids
    if (!team?.team_id) {
      console.log("No team found for user bids, cannot fetch");
      setIsLoading(false);
      if (showToast) {
        toast({
          title: "Error",
          description: "Unable to fetch bids: No team data available",
          variant: "destructive"
        });
      }
      return;
    }

    // Prevent concurrent fetch operations
    if (fetchInProgress.current) {
      console.log("Transfer listing fetch already in progress, skipping");
      return;
    }

    fetchInProgress.current = true;
    console.log("Starting fetch for team ID:", team.team_id);
    
    try {
      if (!isMounted.current) {
        console.log("Component unmounted during fetch preparation, aborting");
        return;
      }
      
      setIsLoading(true);
      const bids = await getUserBids();
      
      if (isMounted.current) {
        setUserBids(bids);
        setIsLoading(false);
      }
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Bids refreshed successfully",
        });
      }
      
      return bids;
    } catch (error) {
      console.error("Failed to fetch user bids:", error);
      
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to fetch bids. Please try again.",
          variant: "destructive"
        });
      }
      
      return [];
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
      fetchInProgress.current = false;
    }
  }, [getUserBids, team, isTeamLoading, toast]);

  useEffect(() => {
    // Reset mount state on component mount
    console.log("User bids hook initialized");
    isMounted.current = true;
    
    // Only fetch when team data is available
    if (!isTeamLoading && team && isFirstLoad.current) {
      console.log("Team data available, fetching user bids for team:", team.team_id);
      fetchUserBids();
      isFirstLoad.current = false;
    } else if (isTeamLoading) {
      console.log("Team data still loading, waiting to fetch bids");
    } else if (isFirstLoad.current && !team) {
      console.log("No team data available, cannot fetch bids");
      isFirstLoad.current = false;
      setIsLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      console.log("User bids hook unmounted");
      isMounted.current = false;
    };
  }, [fetchUserBids, team, isTeamLoading]);

  return {
    userBids,
    isLoading: isLoading || isTeamLoading,
    refetch: fetchUserBids
  };
};
