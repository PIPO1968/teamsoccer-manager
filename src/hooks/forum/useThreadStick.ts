import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
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

      const { data, error } = await supabase
        .from('forum_threads')
        .update({ is_sticky: isSticky })
        .eq('id', threadId)
        .select();

      if (error) throw error;
      return data[0];
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
      toast({
        title: "Error",
        description: "Failed to update thread sticky status",
        variant: "destructive"
      });
    }
  });

  return { toggleThreadSticky };
}
