
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { TopPosterData } from "@/types/community";

export const useTopForumPosters = () => {
  return useQuery({
    queryKey: ['top-forum-posters'],
    queryFn: async (): Promise<TopPosterData[]> => {
      try {
        const data = await apiFetch<{ success: boolean; posters: TopPosterData[] }>(
          '/community/top-posters'
        );
        return data.posters || [];
      } catch {
        return [];
      }
    }
  });
};
