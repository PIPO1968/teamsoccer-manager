import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
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
      const data = await apiFetch<{ success: boolean; groups: Group[] }>('/groups');
      return data.groups || [];
    }
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      if (!managerId) throw new Error("You must be logged in to create a group");
      const data = await apiFetch<{ success: boolean; group: Group }>(
        '/groups',
        { method: 'POST', body: JSON.stringify({ ownerId: managerId, name, description }) }
      );
      return data.group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({ title: "Success", description: "Group created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const applyToGroup = useMutation({
    mutationFn: async ({ groupId, message }: { groupId: number; message?: string }) => {
      if (!managerId) throw new Error("You must be logged in to apply to a group");
      const data = await apiFetch<{ success: boolean; application: GroupApplication }>(
        `/groups/${groupId}/apply`,
        { method: 'POST', body: JSON.stringify({ managerId, message }) }
      );
      return data.application;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-application', variables.groupId, managerId] });
      toast({ title: "Success", description: "Application submitted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: number) => {
      if (!managerId) throw new Error("You must be logged in to delete a group");
      await apiFetch(
        `/groups/${groupId}`,
        { method: 'DELETE', body: JSON.stringify({ managerId }) }
      );
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['manager-groups'] });
      toast({ title: "Success", description: "Group deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return { groups, isLoading, createGroup, applyToGroup, deleteGroup };
}
