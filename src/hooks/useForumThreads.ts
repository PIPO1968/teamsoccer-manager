
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { ForumThread } from '@/types/forum';

export function useForumThreads(forumId: number, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['forum-threads', forumId, page, limit],
    queryFn: async () => {
      const data = await apiFetch<{
        success: boolean;
        stickyThreads: (ForumThread & { reply_count: number; last_post_manager_username: string | null })[];
        normalThreads: (ForumThread & { reply_count: number; last_post_manager_username: string | null })[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      }>(`/forums/${forumId}/threads?page=${page}&limit=${limit}`);
      return {
        stickyThreads: data.stickyThreads || [],
        normalThreads: data.normalThreads || [],
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || page
      };
    },
    enabled: !!forumId
  });
}
