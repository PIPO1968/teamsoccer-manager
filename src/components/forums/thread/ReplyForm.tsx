
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lock } from "lucide-react";
import MarkdownEditorButtons from "@/components/forums/MarkdownEditorButtons";

interface ReplyFormProps {
  isLocked: boolean;
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isDisabled: boolean;
  onMarkdownInsert: (markdown: string, cursorOffset?: number) => void;
}

export default function ReplyForm({
  isLocked,
  content,
  onContentChange,
  onSubmit,
  submitting,
  isDisabled,
  onMarkdownInsert
}: ReplyFormProps) {
  if (isLocked) {
    return (
      <Card className="bg-muted/50 border-muted">
        <CardContent className="p-4 text-center text-muted-foreground">
          <Lock className="h-4 w-4 mx-auto mb-2" />
          <p>This thread is locked. You cannot post replies.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Post a Reply</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <MarkdownEditorButtons onInsert={onMarkdownInsert} />
            <Textarea
              id="content"
              rows={4}
              placeholder="Write your reply here..."
              className="min-h-[120px] resize-y"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isDisabled || submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Submitting..." : "Post Reply"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
