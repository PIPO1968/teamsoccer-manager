
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumCategory, Forum } from '@/types/forum';
import { useManagerId } from '@/hooks/useManagerId';
import { useAuth } from '@/contexts/AuthContext';

export function useForums() {
  const { managerId } = useManagerId();
  const { manager } = useAuth();
  const isAdmin = manager?.is_admin > 0;

  return useQuery({
    queryKey: ['forums', managerId, isAdmin],
    queryFn: async () => {
      // Get forum categories - filter out Staff Forums category for non-admins
      const { data: categories, error: categoriesError } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_number');

      if (categoriesError) throw categoriesError;

      // Filter out Staff Forums category for non-admin users
      const filteredCategories = isAdmin 
        ? categories 
        : categories.filter(category => category.id !== 4);

      // Get group IDs where the user is a member
      const { data: memberGroups, error: memberGroupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('manager_id', managerId)
        .eq('is_active', true);

      if (memberGroupsError) throw memberGroupsError;
      
      const userGroupIds = memberGroups?.map(g => g.group_id) || [];
      
      let forumsData;
      
      if (userGroupIds.length === 0) {
        // If user is not a member of any groups, only get public forums
        // For non-admins, exclude staff forums (category_id = 4)
        let query = supabase
          .from('forums')
          .select('*, groups!left(*)')
          .is('groups', null);
          
        if (!isAdmin) {
          query = query.neq('category_id', 4);
        }
          
        const { data: publicForums, error: publicForumsError } = await query;
          
        if (publicForumsError) throw publicForumsError;
        forumsData = publicForums;
      } else {
        // Get both public forums and forums from groups the user is a member of
        // For non-admins, exclude staff forums (category_id = 4)
        let query = supabase
          .from('forums')
          .select('*, groups!left(*)');
          
        if (isAdmin) {
          query = query.or(`groups.is.null,groups.id.in.(${userGroupIds.join(',')})`);
        } else {
          query = query
            .or(`groups.is.null,groups.id.in.(${userGroupIds.join(',')})`)
            .neq('category_id', 4);
        }
          
        const { data: allForums, error: allForumsError } = await query;
          
        if (allForumsError) {
          console.error('Error fetching forums:', allForumsError);
          
          // Fallback to just getting public forums if there was an error
          let fallbackQuery = supabase
            .from('forums')
            .select('*, groups!left(*)')
            .is('groups', null);
            
          if (!isAdmin) {
            fallbackQuery = fallbackQuery.neq('category_id', 4);
          }
            
          const { data: publicForums, error: publicForumsError } = await fallbackQuery;
            
          if (publicForumsError) throw publicForumsError;
          forumsData = publicForums;
        } else {
          forumsData = allForums;
        }
      }
      
      // Now get thread counts and post counts for each forum
      const forums = await Promise.all(
        forumsData.map(async (forum) => {
          // Get thread count
          const { count: threadCount, error: threadError } = await supabase
            .from('forum_threads')
            .select('*', { count: 'exact', head: true })
            .eq('forum_id', forum.id);
            
          if (threadError) console.error('Error fetching thread count:', threadError);
          
          // First get the thread IDs for this forum
          const { data: threadIds, error: threadIdsError } = await supabase
            .from('forum_threads')
            .select('id')
            .eq('forum_id', forum.id);
            
          if (threadIdsError) {
            console.error('Error fetching thread IDs:', threadIdsError);
            return {
              ...forum,
              thread_count: threadCount || 0,
              post_count: 0
            };
          }
          
          // Extract just the IDs to an array
          const ids = threadIds.map(thread => thread.id);
          
          // If there are no threads, return early with 0 posts
          if (ids.length === 0) {
            return {
              ...forum,
              thread_count: 0,
              post_count: 0
            };
          }
          
          // Get post count using the array of thread IDs
          const { count: postCount, error: postError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .in('thread_id', ids);
            
          if (postError) console.error('Error fetching post count:', postError);
          
          return {
            ...forum,
            thread_count: threadCount || 0,
            post_count: postCount || 0
          } as Forum;
        })
      );

      return {
        categories: filteredCategories as ForumCategory[],
        forums: forums as Forum[]
      };
    },
    enabled: !!managerId
  });
}
