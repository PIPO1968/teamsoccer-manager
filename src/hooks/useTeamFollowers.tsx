
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type TeamFollower = {
  follower_id: number;
  follower_name: string;
  followed_at: string;
};

export const useTeamFollowers = (teamId: string | undefined) => {
  const [followers, setFollowers] = useState<TeamFollower[]>([]);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { manager } = useAuth();

  const fetchFollowers = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      const data = await apiFetch<{ success: boolean; followers: TeamFollower[]; count: number }>(
        `/teams/${parseInt(teamId)}/followers`
      );
      setFollowers(data.followers || []);
      setFollowerCount(data.count || 0);

      if (manager?.user_id) {
        const statusData = await apiFetch<{ success: boolean; isFollowing: boolean }>(
          `/teams/${parseInt(teamId)}/follow-status?managerId=${manager.user_id}`
        );
        setIsFollowing(statusData.isFollowing);
      }
    } catch (error) {
      console.error("Error in useTeamFollowers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!teamId || !manager?.user_id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to follow teams",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await apiFetch<{ success: boolean; isFollowing: boolean }>(
        `/teams/${parseInt(teamId)}/toggle-follow`, {
        method: 'POST',
        body: JSON.stringify({ managerId: manager.user_id }),
      }
      );

      setIsFollowing(data.isFollowing);
      setFollowerCount(prev => data.isFollowing ? prev + 1 : Math.max(prev - 1, 0));

      toast({
        title: data.isFollowing ? "Team followed" : "Team unfollowed",
        description: data.isFollowing
          ? "You are now following this team"
          : "You have unfollowed this team",
      });

      fetchFollowers();
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [teamId, manager?.user_id]);

  return {
    followers,
    followerCount,
    isFollowing,
    isLoading,
    toggleFollow,
    refetch: fetchFollowers
  };
};

