
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread } from '@/types/forum';

export function useForumThreads(forumId: number, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['forum-threads', forumId, page, limit],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      
      // First get the total count
      const { count: totalCount, error: countError } = await supabase
        .from('forum_threads')
        .select('*', { count: 'exact', head: true })
        .eq('forum_id', forumId);

      if (countError) throw countError;

      // Get all threads for this forum (we'll handle pagination differently for sticky vs normal)
      const { data: allThreads, error: threadsError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('forum_id', forumId)
        .order('is_sticky', { ascending: false })
        .order('last_post_at', { ascending: false });

      if (threadsError) throw threadsError;

      // Separate sticky and normal threads
      const stickyThreads = allThreads.filter(thread => thread.is_sticky);
      const normalThreads = allThreads.filter(thread => !thread.is_sticky);

      // Apply pagination only to normal threads
      const paginatedNormalThreads = normalThreads.slice(offset, offset + limit);

      // Combine threads for reply count calculation
      const threadsToProcess = [...stickyThreads, ...paginatedNormalThreads];

      // Get the reply counts and last post manager info for the threads we're displaying
      const threadsWithCounts = await Promise.all(
        threadsToProcess.map(async (thread) => {
          const { count, error: countError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

          if (countError) throw countError;

          // Get last post manager username if there's a last post
          let lastPostManagerUsername = null;
          if (thread.last_post_user_id) {
            const { data: managerData, error: managerError } = await supabase
              .from('managers')
              .select('username')
              .eq('user_id', thread.last_post_user_id)
              .single();

            if (!managerError && managerData) {
              lastPostManagerUsername = managerData.username;
            }
          }

          return {
            ...thread,
            reply_count: count || 0,
            last_post_manager_username: lastPostManagerUsername
          };
        })
      );

      // Separate the processed threads back into sticky and normal
      const processedStickyThreads = threadsWithCounts.filter(thread => thread.is_sticky);
      const processedNormalThreads = threadsWithCounts.filter(thread => !thread.is_sticky);

      return {
        stickyThreads: processedStickyThreads as (ForumThread & { reply_count: number; last_post_manager_username: string | null })[],
        normalThreads: processedNormalThreads as (ForumThread & { reply_count: number; last_post_manager_username: string | null })[],
        totalCount: normalThreads.length, // Only count normal threads for pagination
        totalPages: Math.ceil(normalThreads.length / limit),
        currentPage: page
      };
    },
    enabled: !!forumId
  });
}
