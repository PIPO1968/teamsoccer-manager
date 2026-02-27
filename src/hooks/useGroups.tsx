import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useManagerId } from "@/hooks/useManagerId";

export interface Group {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  forum_id: number | null;
  logo_url: string | null;
  club_logo: string | null;
  member_count: number;
  accurate_member_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupApplication {
  id: number;
  group_id: number;
  applicant_id: number;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function useGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { managerId } = useManagerId();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          member_count:group_members(count)
        `)
        .eq('group_members.is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedGroups = data.map(group => ({
        ...group,
        member_count: group.member_count[0].count || 0
      }));
      
      return formattedGroups as Group[];
    }
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!managerId) throw new Error("You must be logged in to create a group");
      
      const { data, error } = await supabase
        .from('groups')
        .insert([{ 
          name, 
          description,
          owner_id: managerId 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const applyToGroup = useMutation({
    mutationFn: async ({ groupId, message }: { groupId: number; message?: string }) => {
      if (!managerId) throw new Error("You must be logged in to apply to a group");
      
      const { data: existingApplication, error: checkError } = await supabase
        .from('group_applications')
        .select('*')
        .eq('group_id', groupId)
        .eq('applicant_id', managerId)
        .eq('status', 'pending');
        
      if (checkError) throw checkError;
      
      if (existingApplication && existingApplication.length > 0) {
        throw new Error("You have already applied to this group");
      }
      
      const { data, error } = await supabase
        .from('group_applications')
        .insert([
          { 
            group_id: groupId, 
            applicant_id: managerId,
            message 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-application', variables.groupId, managerId] });
      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: number) => {
      if (!managerId) throw new Error("You must be logged in to delete a group");
      
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .eq('owner_id', managerId)
        .single();
        
      if (groupError) throw new Error("Group not found or you don't have permission to delete it");
      
      const forumId = group.forum_id;
      
      const { error: appError } = await supabase
        .from('group_applications')
        .delete()
        .eq('group_id', groupId);
        
      if (appError) throw appError;
      
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);
        
      if (membersError) throw membersError;
      
      const { error: groupDeleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
        
      if (groupDeleteError) throw groupDeleteError;
      
      if (forumId) {
        const { data: threads, error: threadsError } = await supabase
          .from('forum_threads')
          .select('id')
          .eq('forum_id', forumId);
          
        if (threadsError) throw threadsError;
        
        if (threads && threads.length > 0) {
          const threadIds = threads.map(thread => thread.id);
          
          const { error: postsError } = await supabase
            .from('forum_posts')
            .delete()
            .in('thread_id', threadIds);
            
          if (postsError) throw postsError;
          
          const { error: threadDeleteError } = await supabase
            .from('forum_threads')
            .delete()
            .eq('forum_id', forumId);
            
          if (threadDeleteError) throw threadDeleteError;
        }
        
        const { error: forumError } = await supabase
          .from('forums')
          .delete()
          .eq('id', forumId);
          
        if (forumError) throw forumError;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['manager-groups'] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    groups,
    isLoading,
    createGroup,
    applyToGroup,
    deleteGroup
  };
}
