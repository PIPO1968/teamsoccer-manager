
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      
      // Get teams that the manager follows
      const { data, error } = await supabase
        .from('team_followers')
        .select('team_id, teams:team_id(name)')
        .eq('follower_id', parseInt(managerId));
        
      if (error) {
        console.error("Error fetching followed teams:", error);
        return;
      }
      
      // Format the data
      const formattedTeams: FollowedTeam[] = data.map(item => ({
        team_id: item.team_id,
        team_name: item.teams?.name || 'Unknown Team'
      }));
      
      setFollowedTeams(formattedTeams);
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
