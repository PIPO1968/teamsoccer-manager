
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { format } from "date-fns";
import PostUserInfo from "@/components/forums/PostUserInfo";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import { ForumPost as ForumPostType } from "@/types/forum";

interface ForumPostProps {
  post: ForumPostType;
  isAuthor: boolean;
  editingPostId: number | null;
  editContent: string;
  onEditStart: (postId: number, content: string) => void;
  onEditChange: (content: string) => void;
  onEditSave: (postId: number) => void;
  onEditCancel: () => void;
  onDelete: (postId: number) => void;
  onMarkdownInsert: (markdown: string, cursorOffset?: number) => void;
}

export default function ForumPost({
  post,
  isAuthor,
  editingPostId,
  editContent,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
  onMarkdownInsert
}: ForumPostProps) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-0 pt-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Posted on {format(new Date(post.created_at), "PPp")}
              {post.is_edited && 
                <span className="ml-2 text-xs italic text-muted-foreground">
                  (edited {format(new Date(post.edited_at!), "PP")})
                </span>
              }
            </span>
          </div>
          <PostUserInfo
            userId={post.user_id}
            createdAt={post.created_at}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <PostContent
          content={post.content}
          isEditing={editingPostId === post.id}
          editContent={editContent}
          onEditChange={onEditChange}
          onSave={() => onEditSave(post.id)}
          onCancel={onEditCancel}
          onMarkdownInsert={onMarkdownInsert}
        />
      </CardContent>
      {isAuthor && editingPostId !== post.id && (
        <CardFooter>
          <PostActions
            onEdit={() => onEditStart(post.id, post.content)}
            onDelete={() => onDelete(post.id)}
          />
        </CardFooter>
      )}
    </Card>
  );
}
