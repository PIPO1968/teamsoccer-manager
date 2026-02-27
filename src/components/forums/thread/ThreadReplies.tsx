
import { ForumPost as ForumPostType } from "@/types/forum";
import ForumPost from "./ForumPost";

interface ThreadRepliesProps {
  posts: ForumPostType[];
  managerId: number | null;
  editingPostId: number | null;
  editContent: string;
  onEditStart: (postId: number, content: string) => void;
  onEditChange: (content: string) => void;
  onEditSave: (postId: number) => void;
  onEditCancel: () => void;
  onDelete: (postId: number) => void;
  onMarkdownInsert: (markdown: string, cursorOffset?: number) => void;
}

export default function ThreadReplies({
  posts,
  managerId,
  editingPostId,
  editContent,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
  onMarkdownInsert
}: ThreadRepliesProps) {
  if (posts.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        No replies yet. Be the first to reply!
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <ForumPost
          key={post.id}
          post={post}
          isAuthor={managerId === post.user_id}
          editingPostId={editingPostId}
          editContent={editContent}
          onEditStart={onEditStart}
          onEditChange={onEditChange}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
          onDelete={onDelete}
          onMarkdownInsert={onMarkdownInsert}
        />
      ))}
    </>
  );
}
