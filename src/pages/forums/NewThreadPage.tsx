
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useManagerId } from "@/hooks/useManagerId";
import MarkdownEditorButtons from "@/components/forums/MarkdownEditorButtons";

export default function NewThreadPage() {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { manager } = useAuth();
  const { managerId } = useManagerId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manager || !managerId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a thread",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the thread
      const { data: threadData, error: threadError } = await supabase
        .from("forum_threads")
        .insert({
          forum_id: Number(forumId),
          user_id: managerId,
          title
        })
        .select()
      try {
        // Crear el hilo usando la API Express
        const response = await fetch('/api/forums/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            forum_id: forumId,
            author_id: managerId,
            created_at: new Date().toISOString(),
          })
        });
        if (!response.ok) throw new Error('No se pudo crear el hilo');
        const data = await response.json();
        if (data.thread) {
          toast({
            title: "Thread created",
            description: `Thread '${title}' created successfully!`,
          });
          navigate(`/forums/${forumId}`);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create thread",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }

      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Thread</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Content
                  </label>
                  <MarkdownEditorButtons onInsert={handleMarkdownInsert} />
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    minLength={10}
                    rows={8}
                    className="min-h-[200px] resize-y"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Thread"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }
  }
