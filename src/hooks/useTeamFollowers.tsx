
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      
      // Get followers list
      const { data: followersData, error: followersError } = await supabase
        .rpc('get_team_followers', { p_team_id: parseInt(teamId) });
        
      if (followersError) {
        console.error("Error fetching followers:", followersError);
        return;
      }
      
      // Get follower count
      const { data: countData, error: countError } = await supabase
        .rpc('get_team_follower_count', { p_team_id: parseInt(teamId) });
        
      if (countError) {
        console.error("Error fetching follower count:", countError);
        return;
      }
      
      // Check if current manager is following
      if (manager?.user_id) {
        const { data: isFollowingData, error: isFollowingError } = await supabase
          .rpc('is_following_team', { 
            p_team_id: parseInt(teamId), 
            p_follower_id: manager.user_id 
          });
          
        if (!isFollowingError) {
          setIsFollowing(!!isFollowingData);
        }
      }
      
      setFollowers(followersData || []);
      setFollowerCount(countData || 0);
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
      const { data, error } = await supabase
        .rpc('toggle_team_follow', { 
          p_team_id: parseInt(teamId), 
          p_follower_id: manager.user_id 
        });
        
      if (error) {
        throw error;
      }
      
      setIsFollowing(!!data);
      setFollowerCount(prev => data ? prev + 1 : Math.max(prev - 1, 0));
      
      toast({
        title: data ? "Team followed" : "Team unfollowed",
        description: data 
          ? "You are now following this team" 
          : "You have unfollowed this team",
      });
      
      // Refresh followers list
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
