
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { ForumThread, ForumPost } from '@/types/forum';

export function useThreadData(threadId: number, page: number = 1, postsPerPage: number = 10) {
  return useQuery({
    queryKey: ['thread', threadId, page, postsPerPage],
    queryFn: async () => {
      const data = await apiFetch<{
        success: boolean;
        thread: ForumThread & { forum_category_id?: number };
        posts: (ForumPost & { author_username: string })[];
        totalPosts: number;
        totalPages: number;
        currentPage: number;
      }>(`/threads/${threadId}?page=${page}&perPage=${postsPerPage}`);
      return {
        thread: data.thread,
        posts: data.posts || [],
        totalPosts: data.totalPosts || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || page
      };
    },
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 1000 * 60 * 5,
  });
}
