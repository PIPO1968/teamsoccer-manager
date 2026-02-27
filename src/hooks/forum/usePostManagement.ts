
import { useState } from "react";
import { useThread } from "@/hooks/useThread";
import { useManagerId } from "@/hooks/useManagerId";

export function usePostManagement(threadId: number, currentPage: number, postsPerPage: number) {
  const { managerId } = useManagerId();
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { 
    data, 
    isLoading: threadLoading, 
    error,
    refetch,
    toggleThreadLock,
    toggleThreadSticky,
    trackView,
    viewTracked,
    createPost,
    editPost,
    deletePost
  } = useThread(threadId, currentPage, postsPerPage);

  const handleSubmit = async (e: React.FormEvent, handlePageChange: (page: number) => void) => {
    e.preventDefault();
    if (!threadId || !content.trim() || !managerId) return;

    setSubmitting(true);
    try {
      await createPost.mutateAsync({ content });
      await refetch();
      setContent("");
      // Navigate to the last page after creating a new post
      if (data?.totalPages && data.totalPages > currentPage) {
        handlePageChange(data.totalPages);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (postId: number) => {
    if (!editContent.trim()) return;
    try {
      await editPost.mutateAsync({ postId, content: editContent });
      setEditingPostId(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await deletePost.mutateAsync({ postId });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleMarkdownInsert = (markdown: string, cursorOffset?: number) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = before + markdown + after;
    setContent(newText);
    
    textarea.focus();
    const newCursorPos = cursorOffset 
      ? start + markdown.length + cursorOffset 
      : start + markdown.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  const handleEditMarkdownInsert = (markdown: string, cursorOffset?: number) => {
    const textarea = document.getElementById('edit-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = before + markdown + after;
    setEditContent(newText);
    
    textarea.focus();
    const newCursorPos = cursorOffset 
      ? start + markdown.length + cursorOffset 
      : start + markdown.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  return {
    data,
    threadLoading,
    error,
    refetch,
    toggleThreadLock,
    toggleThreadSticky,
    trackView,
    viewTracked,
    managerId,
    content,
    setContent,
    editingPostId,
    setEditingPostId,
    editContent,
    setEditContent,
    submitting,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleMarkdownInsert,
    handleEditMarkdownInsert
  };
}
