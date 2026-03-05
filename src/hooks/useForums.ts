
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { ForumCategory, Forum } from '@/types/forum';
import { useAuth } from '@/contexts/AuthContext';

export function useForums() {
  const { manager } = useAuth();
  const isAdmin = manager?.is_admin > 0;

  return useQuery({
    queryKey: ['forums', isAdmin],
    queryFn: async () => {
      const data = await apiFetch<{ success: boolean; categories: ForumCategory[]; forums: (Forum & { thread_count: number; post_count: number })[] }>(
        `/forums?isAdmin=${isAdmin ? '1' : '0'}`
      );
      return {
        categories: data.categories || [],
        forums: data.forums || []
      };
    }
  });
}
