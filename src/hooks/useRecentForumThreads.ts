
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread } from '@/types/forum';

export function useRecentForumThreads(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-forum-threads', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          forums!inner(
            id,
            name,
            category_id
          )
        `)
        .in('forums.category_id', [2, 5])
        .order('last_post_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as (ForumThread & { forums: { id: number; name: string; category_id: number } })[];
    }
  });
}
