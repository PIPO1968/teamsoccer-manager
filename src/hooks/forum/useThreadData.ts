
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumThread, ForumPost } from '@/types/forum';

export function useThreadData(threadId: number, page: number = 1, postsPerPage: number = 10) {
  return useQuery({
    queryKey: ['thread', threadId, page, postsPerPage],
    queryFn: async () => {
      try {
        // Fetch thread data
        const { data: thread, error: threadError } = await supabase
          .from('forum_threads')
          .select('*')
          .eq('id', threadId)
          .single();

        if (threadError) {
          console.error('Error fetching thread:', threadError);
          throw new Error(`Failed to fetch thread: ${threadError.message}`);
        }

        if (!thread) {
          throw new Error('Thread not found');
        }

        // Get total count of posts
        const { count: totalPosts, error: countError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', threadId);

        if (countError) {
          console.error('Error fetching post count:', countError);
          throw new Error(`Failed to fetch post count: ${countError.message}`);
        }

        // Calculate pagination
        const offset = (page - 1) * postsPerPage;
        
        // Fetch posts for this page
        const { data: posts, error: postsError } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('thread_id', threadId)
          .order('created_at')
          .range(offset, offset + postsPerPage - 1);

        if (postsError) {
          console.error('Error fetching posts:', postsError);
          throw new Error(`Failed to fetch posts: ${postsError.message}`);
        }

        // If there are no posts, we can return early with an empty array
        if (!posts || posts.length === 0) {
          return {
            thread: thread as ForumThread,
            posts: [] as ForumPost[],
            totalPosts: totalPosts || 0,
            totalPages: Math.ceil((totalPosts || 0) / postsPerPage),
            currentPage: page
          };
        }

        // Extract all unique user IDs from posts
        const userIds = [...new Set(posts.map(post => post.user_id))];
        
        // Fetch managers to get usernames
        const { data: managers, error: managersError } = await supabase
          .from('managers')
          .select('user_id, username')
          .in('user_id', userIds);

        if (managersError) {
          console.error('Error fetching managers:', managersError);
          // Don't throw here, we'll use "Unknown" for missing usernames
        }

        // Create a map of user IDs to usernames
        const userNameMap: Record<string, string> = {};
        if (managers) {
          managers.forEach(manager => {
            userNameMap[manager.user_id] = manager.username;
          });
        }

        // Enrich posts with author usernames
        const enrichedPosts = posts.map(post => ({
          ...post,
          author_username: userNameMap[post.user_id] || 'Unknown'
        }));

        return {
          thread: thread as ForumThread,
          posts: enrichedPosts as ForumPost[],
          totalPosts: totalPosts || 0,
          totalPages: Math.ceil((totalPosts || 0) / postsPerPage),
          currentPage: page
        };
      } catch (error) {
        console.error('Error in useThreadData:', error);
        throw error; // Re-throw for React Query to handle
      }
    },
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
