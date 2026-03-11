
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/services/apiClient';
import { ForumPost } from '@/types/forum';
import { useToast } from '@/hooks/use-toast';
import { useManagerId } from '@/hooks/useManagerId';

export function useForumPost(threadId: number) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { managerId } = useManagerId();

  const createPost = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      if (!managerId) {
        throw new Error("You must be logged in to post");
      }
      const data = await apiFetch<{ success: boolean; post: ForumPost }>(
        `/threads/${threadId}/posts`,
        { method: 'POST', body: JSON.stringify({ userId: managerId, content }) }
      );
      return data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({ title: "Post created", description: "Your reply has been posted successfully." });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast({ title: "Error", description: "Failed to create post. Please try again.", variant: "destructive" });
    }
  });

  const editPost = useMutation({
    mutationFn: async ({ postId, content }: { postId: number, content: string }) => {
      const data = await apiFetch<{ success: boolean; post: ForumPost }>(
        `/posts/${postId}`,
        { method: 'PUT', body: JSON.stringify({ content }) }
      );
      return data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      toast({ title: "Post Updated", description: "Your post has been updated successfully." });
    },
    onError: (error) => {
      console.error("Error updating post:", error);
      toast({ title: "Error", description: "Failed to update post. Please try again.", variant: "destructive" });
    }
  });

  const deletePost = useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      return postId;
    },
    onSuccess: (deletedPostId) => {
      queryClient.setQueryData(['thread', threadId], (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, posts: oldData.posts.filter((post: ForumPost) => post.id !== deletedPostId) };
      });
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] });
      toast({ title: "Post Deleted", description: "Your post has been deleted successfully." });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({ title: "Error", description: "Failed to delete post. Please try again.", variant: "destructive" });
    }
  });

  return { createPost, editPost, deletePost };
}
