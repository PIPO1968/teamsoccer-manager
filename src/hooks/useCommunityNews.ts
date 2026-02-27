
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommunityNewsItem } from "@/types/community";

export const useCommunityNews = () => {
  return useQuery({
    queryKey: ['community-news'],
    queryFn: async (): Promise<CommunityNewsItem[]> => {
      const { data, error } = await supabase
        .from('community_news')
        .select(`
          *,
          author:managers(username)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });
};
