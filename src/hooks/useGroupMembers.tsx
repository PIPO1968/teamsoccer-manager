import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
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
      const data = await apiFetch<{ success: boolean; members: GroupMember[] }>(
        `/groups/${groupId}/members`
      );
      return data.members || [];
    },
    enabled: !!groupId
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['group-applications', groupId],
    queryFn: async () => {
      const data = await apiFetch<{ success: boolean; applications: (GroupApplication & { applicant: { username: string } })[] }>(
        `/groups/${groupId}/applications`
      );
      return data.applications || [];
    },
    enabled: !!groupId
  });

  const { data: userApplication } = useQuery({
    queryKey: ['user-application', groupId, manager?.user_id],
    queryFn: async () => {
      if (!manager?.user_id) return null;
      const data = await apiFetch<{ success: boolean; application: GroupApplication | null }>(
        `/groups/${groupId}/applications/user/${manager.user_id}`
      );
      return data.application || null;
    },
    enabled: !!groupId && !!manager?.user_id
  });

  const handleApplication = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: 'approved' | 'rejected' }) => {
      const data = await apiFetch<{ success: boolean; application: GroupApplication }>(
        `/groups/${groupId}/applications/${applicationId}/respond`,
        { method: 'PUT', body: JSON.stringify({ status }) }
      );
      return data.application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-applications', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: "Success", description: "Application processed successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return { members, isLoading, applications, applicationsLoading, userApplication, handleApplication };
}
