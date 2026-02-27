import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface GroupMember {
  id: number;
  group_id: number;
  manager_id: number;
  joined_at: string;
  role: 'owner' | 'member';
  is_active: boolean;
  manager?: {
    username: string;
  };
}

export interface GroupApplication {
  id: number;
  group_id: number;
  applicant_id: number;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function useGroupMembers(groupId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { manager } = useAuth();

  const { data: members, isLoading } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          manager:managers(username)
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (error) throw error;
      
      // Ensure the role field is correctly typed
      return data?.map(member => ({
        ...member,
        role: member.role as 'owner' | 'member'
      })) || [];
    },
    enabled: !!groupId
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['group-applications', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_applications')
        .select(`
          *,
          applicant:managers(username)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending');

      if (error) throw error;
      return data;
    },
    enabled: !!groupId
  });

  const { data: userApplication } = useQuery({
    queryKey: ['user-application', groupId, manager?.user_id],
    queryFn: async () => {
      if (!manager?.user_id) return null;
      
      const { data, error } = await supabase
        .from('group_applications')
        .select('*')
        .eq('group_id', groupId)
        .eq('applicant_id', manager.user_id)
        .eq('status', 'pending')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }
      return data;
    },
    enabled: !!groupId && !!manager?.user_id
  });

  const handleApplication = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: 'approved' | 'rejected' }) => {
      if (status === 'approved') {
        const { data: application, error: appError } = await supabase
          .from('group_applications')
          .select('applicant_id')
          .eq('id', applicationId)
          .single();
        
        if (appError) throw appError;
        
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            manager_id: application.applicant_id,
            role: 'member'
          });
        
        if (memberError) throw memberError;
      }
      
      const { data, error } = await supabase
        .from('group_applications')
        .update({ 
          status, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-applications', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] }); // Refresh group list to update member count
      toast({
        title: "Success",
        description: "Application processed successfully",
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
    members,
    isLoading,
    applications,
    applicationsLoading,
    userApplication,
    handleApplication
  };
}
