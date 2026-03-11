import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useThreadLock(threadId: number) {
  const queryClient = useQueryClient();
  const { manager } = useAuth();
  const { toast } = useToast();

  const toggleThreadLock = useMutation({
    mutationFn: async ({ isLocked }: { isLocked: boolean }) => {
      if (!manager?.is_admin || manager.is_admin <= 0) {
        throw new Error("Only administrators can lock/unlock threads");
      }
      const data = await apiFetch<{ success: boolean; thread: { is_locked: boolean } }>(
        `/threads/${threadId}/lock`,
        { method: 'PUT', body: JSON.stringify({ isLocked }) }
      );
      return data.thread;
    },
    onSuccess: (updatedThread) => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({
        title: "Success",
        description: `Thread ${updatedThread.is_locked ? 'locked' : 'unlocked'} successfully`
      });
    },
    onError: (error) => {
      console.error("Error toggling thread lock:", error);
      toast({ title: "Error", description: "Failed to update thread status", variant: "destructive" });
    }
  });

  return { toggleThreadLock };
}
