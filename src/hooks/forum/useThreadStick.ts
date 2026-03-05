import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useThreadStick() {
  const queryClient = useQueryClient();
  const { manager } = useAuth();
  const { toast } = useToast();

  const toggleThreadSticky = useMutation({
    mutationFn: async ({ threadId, isSticky }: { threadId: number, isSticky: boolean }) => {
      if (!manager?.is_admin || manager.is_admin <= 0) {
        throw new Error("Only administrators can stick/unstick threads");
      }
      const data = await apiFetch<{ success: boolean; thread: { is_sticky: boolean } }>(
        `/threads/${threadId}/sticky`,
        { method: 'PUT', body: JSON.stringify({ isSticky }) }
      );
      return data.thread;
    },
    onSuccess: (updatedThread, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({
        title: "Success",
        description: `Thread ${updatedThread.is_sticky ? 'stuck' : 'unstuck'} successfully`
      });
    },
    onError: (error) => {
      console.error("Error toggling thread sticky status:", error);
      toast({ title: "Error", description: "Failed to update thread sticky status", variant: "destructive" });
    }
  });

  return { toggleThreadSticky };
}
