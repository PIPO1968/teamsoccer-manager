
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { ForumThread } from '@/types/forum';

export function useRecentForumThreads(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-forum-threads', limit],
    queryFn: async () => {
      try {
        const data = await apiFetch<{ success: boolean; threads: any[] }>(
          `/forums/recent-threads?limit=${limit}`
        );
        return (data.threads || []) as (ForumThread & { forums: { id: number; name: string; category_id: number } })[];
      } catch {
        return [];
      }
    }
  });
}
