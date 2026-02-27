
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManagerEvent {
  event_type: string;
  event_description: string;
  created_at: string;
}

export const useManagerEvents = (managerId: string | undefined) => {
  return useQuery({
    queryKey: ['manager-events', managerId],
    queryFn: async (): Promise<ManagerEvent[]> => {
      if (!managerId) return [];
      
      const { data, error } = await supabase
        .rpc('get_manager_recent_events', { 
          p_manager_id: parseInt(managerId) 
        });

      if (error) {
        console.error('Error fetching manager events:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!managerId,
  });
};
