
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManagerProfile {
  user_id: number;
  username: string;
  email: string;
  country_id: number; // Use country_id instead of country
  is_admin: number;
  is_premium?: number;
  premium_expires_at?: string;
  status?: string;
  created_at: string;
  country_name?: string; // We'll join to get the country name
  teams?: {
    name: string;
    team_id: number;
    created_at: string;
    is_bot: number;
    club_logo?: string;
  }[];
}

export const useManagerProfile = (managerId: number | null) => {
  return useQuery({
    queryKey: ['manager-profile', managerId],
    queryFn: async (): Promise<ManagerProfile | null> => {
      if (!managerId) return null;
      
      console.log('Fetching manager profile for ID:', managerId);
      
      // First get the manager data with country name
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select(`
          user_id, 
          username, 
          email, 
          country_id, 
          is_admin, 
          is_premium, 
          premium_expires_at, 
          status, 
          created_at,
          leagues_regions!managers_country_id_fkey (name)
        `)
        .eq('user_id', managerId)
        .single();

      if (managerError) {
        console.error('Error fetching manager profile:', managerError);
        throw managerError;
      }

      console.log('Manager profile data retrieved:', managerData);

      // Then get the team data if the manager has a team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('name, team_id, created_at, is_bot, club_logo')
        .eq('manager_id', managerId);

      if (teamError) {
        console.error('Error fetching manager teams:', teamError);
        // Don't throw error for teams, just log it
      }

      return {
        ...managerData,
        country_name: managerData.leagues_regions?.name,
        teams: teamData || []
      };
    },
    enabled: !!managerId,
  });
};
