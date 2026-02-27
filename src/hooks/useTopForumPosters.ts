
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopPosterData } from "@/types/community";

export const useTopForumPosters = () => {
  return useQuery({
    queryKey: ['top-forum-posters'],
    queryFn: async (): Promise<TopPosterData[]> => {
      console.log('Fetching top forum posters...');
      
      // First, let's try a simpler query to see if the view exists
      const { data, error } = await supabase
        .from('top_forum_posters')
        .select('*')
        .limit(10);
      
      if (error) {
        console.error('Error fetching top forum posters:', error);
        throw error;
      }
      
      console.log('Top forum posters data:', data);
      
      // If we have data, let's enhance it with manager details
      if (data && data.length > 0) {
        const enhancedData = await Promise.all(
          data.map(async (poster): Promise<TopPosterData> => {
            if (poster.user_id) {
              const { data: managerData, error: managerError } = await supabase
                .from('managers')
                .select(`
                  country_id,
                  country:leagues_regions!managers_country_id_fkey(name)
                `)
                .eq('user_id', poster.user_id)
                .single();
              
              if (!managerError && managerData) {
                return {
                  ...poster,
                  manager: managerData
                };
              }
            }
            return poster as TopPosterData;
          })
        );
        
        return enhancedData;
      }
      
      return (data || []) as TopPosterData[];
    }
  });
};
