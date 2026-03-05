
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { CommunityNewsItem } from "@/types/community";

export const useCommunityNews = () => {
  return useQuery({
    queryKey: ['community-news'],
    queryFn: async (): Promise<CommunityNewsItem[]> => {
      const data = await apiFetch<{ success: boolean; news: any[] }>('/community/news');
      return (data.news || []).map(item => ({
        ...item,
        author: { username: item.author_username }
      }));
    }
  });
};
