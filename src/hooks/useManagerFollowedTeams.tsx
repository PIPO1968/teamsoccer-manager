
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "@/hooks/use-toast";

export type FollowedTeam = {
  team_id: number;
  team_name: string;
};

export const useManagerFollowedTeams = (managerId: string | undefined) => {
  const [followedTeams, setFollowedTeams] = useState<FollowedTeam[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFollowedTeams = async () => {
    if (!managerId) return;

    try {
      setIsLoading(true);
      const data = await apiFetch<{ success: boolean; followedTeams: FollowedTeam[] }>(
        `/managers/${parseInt(managerId)}/followed-teams`
      );
      setFollowedTeams(data.followedTeams || []);
    } catch (error) {
      console.error("Error in useManagerFollowedTeams:", error);
      toast({
        title: "Error",
        description: "Could not load followed teams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowedTeams();
  }, [managerId]);

  return {
    followedTeams,
    isLoading,
    refetch: fetchFollowedTeams
  };
};
