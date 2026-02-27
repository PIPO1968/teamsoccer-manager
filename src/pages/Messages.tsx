
import { useMessages, Message } from "@/hooks/useMessages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { Inbox, Mail, Trash2, Reply } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { NewMessageDialog } from "@/components/messages/NewMessageDialog";

const Messages = () => {
  const { messages, isLoading, markAsRead, deleteMessage } = useMessages();
  const { manager } = useAuth();

  const handleMarkAsRead = async (message: Message) => {
    const success = await markAsRead(message.id);
    if (success) {
      toast.success("Message marked as read");
    }
  };

  const handleDelete = async (message: Message) => {
    const success = await deleteMessage(message.id);
    if (success) {
      toast.success("Message deleted");
    }
  };

  const getReplySubject = (originalSubject: string) => {
    if (originalSubject.startsWith("Re: ")) {
      return originalSubject;
    }
    return `Re: ${originalSubject}`;
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className={message.read ? "bg-muted/50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {!message.read && message.recipient_id === manager?.user_id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <Link
                            to={`/manager/${message.sender_id === manager?.user_id ? message.recipient_id : message.sender_id}`}
                            className="font-medium hover:underline"
                          >
                            {message.sender_id === manager?.user_id ? `To: ${message.recipient_name}` : `From: ${message.sender_name}`}
                          </Link>
                        </div>
                        <h3 className="font-semibold">{message.subject}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(message.created_at), "PPpp")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {/* Reply button - only show if current user is not the sender */}
                        {message.sender_id !== manager?.user_id && (
                          <NewMessageDialog
                            recipientId={message.sender_id}
                            recipientName={message.sender_name}
                            initialSubject={getReplySubject(message.subject)}
                            trigger={
                              <Button size="sm" variant="outline">
                                <Reply className="h-4 w-4" />
                              </Button>
                            }
                          />
                        )}
                        {!message.read && message.recipient_id === manager?.user_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(message)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(message)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
