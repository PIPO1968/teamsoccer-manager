
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMessages } from "@/hooks/useMessages";

type NewMessageDialogProps = {
  recipientId: number;
  recipientName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  initialSubject?: string;
};

export const NewMessageDialog = ({ 
  recipientId, 
  recipientName, 
  onSuccess, 
  trigger,
  initialSubject = ""
}: NewMessageDialogProps) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(initialSubject);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useMessages();

  // Update subject when initialSubject changes
  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await sendMessage(recipientId, subject, content);
      if (success) {
        toast.success("Message sent successfully");
        setOpen(false);
        setSubject(initialSubject);
        setContent("");
        onSuccess?.();
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="secondary">Send Message</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Send Message to {recipientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[200px]"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
