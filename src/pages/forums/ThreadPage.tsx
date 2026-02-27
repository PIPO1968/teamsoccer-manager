
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useThreadAccess } from "@/hooks/forum/useThreadAccess";
import { useThreadPagination } from "@/hooks/forum/useThreadPagination";
import { usePostManagement } from "@/hooks/forum/usePostManagement";
import ThreadBreadcrumb from "@/components/forums/thread/ThreadBreadcrumb";
import ThreadHeader from "@/components/forums/thread/ThreadHeader";
import ThreadReplies from "@/components/forums/thread/ThreadReplies";
import ThreadLoading from "@/components/forums/thread/ThreadLoading";
import ThreadError from "@/components/forums/thread/ThreadError";
import ThreadAccessGuard from "@/components/forums/thread/ThreadAccessGuard";
import ThreadPagination from "@/components/forums/thread/ThreadPagination";
import ForumPost from "@/components/forums/thread/ForumPost";
import ReplyForm from "@/components/forums/thread/ReplyForm";

export default function ThreadPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { manager } = useAuth();
  const { hasAccess, isCheckingAccess } = useThreadAccess(threadId);
  const { currentPage, handlePageChange } = useThreadPagination();
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
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
  } = usePostManagement(Number(threadId), currentPage, 10);

  useEffect(() => {
    if (data?.thread && !viewTracked) {
      trackView();
    }
  }, [data?.thread, viewTracked, trackView]);

  // Scroll to bottom when data loads or changes
  useEffect(() => {
    if (data && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  if (threadLoading) {
    return <ThreadLoading />;
  }

  if (error || !data) {
    return <ThreadError onRetry={refetch} />;
  }

  const { thread, posts, totalPages } = data;
  const firstPost = posts?.[0];

  return (
    <ThreadAccessGuard isCheckingAccess={isCheckingAccess} hasAccess={hasAccess}>
      <div className="space-y-6">
        <ThreadBreadcrumb forumId={thread.forum_id} threadTitle={thread.title} />
        
        {/* Top pagination - centered above thread title */}
        <div className="flex justify-center">
          <ThreadPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        
        <ThreadHeader
          title={thread.title}
          isAdmin={manager?.is_admin || 0}
          isLocked={thread.is_locked}
          isSticky={thread.is_sticky}
          onToggleLock={(isLocked) => toggleThreadLock.mutate({ isLocked })}
          onToggleSticky={(threadId, isSticky) => toggleThreadSticky.mutate({ threadId, isSticky })}
          threadId={thread.id}
          toggleLockLoading={toggleThreadLock.isPending}
        />

        {/* Show first post only on first page */}
        {currentPage === 1 && firstPost && (
          <ForumPost
            post={firstPost}
            isAuthor={managerId === firstPost.user_id}
            editingPostId={editingPostId}
            editContent={editContent}
            onEditStart={(postId, content) => {
              setEditingPostId(postId);
              setEditContent(content);
            }}
            onEditChange={setEditContent}
            onEditSave={handleEdit}
            onEditCancel={() => {
              setEditingPostId(null);
              setEditContent("");
            }}
            onDelete={handleDelete}
            onMarkdownInsert={handleEditMarkdownInsert}
          />
        )}

        <div className="space-y-6 mt-6">
          <h2 className="text-lg font-semibold">
            {currentPage === 1 ? "Replies" : `Posts (Page ${currentPage})`}
          </h2>
          
          <ThreadReplies 
            posts={currentPage === 1 ? posts?.slice(1) || [] : posts || []}
            managerId={managerId}
            editingPostId={editingPostId}
            editContent={editContent}
            onEditStart={(postId, content) => {
              setEditingPostId(postId);
              setEditContent(content);
            }}
            onEditChange={setEditContent}
            onEditSave={handleEdit}
            onEditCancel={() => {
              setEditingPostId(null);
              setEditContent("");
            }}
            onDelete={handleDelete}
            onMarkdownInsert={handleEditMarkdownInsert}
          />

          <ThreadPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <div className="mt-8">
          <ReplyForm
            isLocked={thread.is_locked}
            content={content}
            onContentChange={setContent}
            onSubmit={(e) => handleSubmit(e, handlePageChange)}
            submitting={submitting}
            isDisabled={!content.trim() || !managerId}
            onMarkdownInsert={handleMarkdownInsert}
          />
        </div>
        
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} />
      </div>
    </ThreadAccessGuard>
  );
}
