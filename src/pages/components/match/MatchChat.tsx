
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send } from 'lucide-react';
import { useMatchChat } from '@/hooks/useMatchChat';
import { useManagerId } from '@/hooks/useManagerId';
import { Link } from 'react-router-dom';

interface MatchChatProps {
  matchId: number;
}

const MatchChat: React.FC<MatchChatProps> = ({ matchId }) => {
  const [newMessage, setNewMessage] = useState('');
  const { messages, isLoading, sendMessage } = useMatchChat(matchId);
  const { managerId } = useManagerId();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !managerId) return;
    
    await sendMessage(newMessage, managerId);
    setNewMessage('');
  };

  // Auto-scroll to top when new messages arrive (since newest are at top)
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = 0;
      }
    }
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Reverse messages to show newest at top
  const reversedMessages = [...messages].reverse();

  return (
    <Card className="w-full">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Match Chat
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col h-64">
          {/* Messages Area */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading chat messages...</div>
            ) : reversedMessages.length === 0 ? (
              <div className="text-center text-gray-500">
                No messages yet. Be the first to start the conversation!
              </div>
            ) : (
              <div className="space-y-3">
                {reversedMessages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Link 
                        to={`/manager/${message.user_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {message.username}
                      </Link>
                      <span>•</span>
                      <span>{formatMessageTime(message.created_at)}</span>
                    </div>
                    <div className="text-sm mt-1 bg-gray-50 rounded-lg p-2">
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                maxLength={500}
                className="flex-1"
                disabled={!managerId}
              />
              <Button 
                type="submit" 
                size="sm"
                disabled={!newMessage.trim() || !managerId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {!managerId && (
              <p className="text-xs text-gray-500 mt-2">
                You need to be logged in to send messages.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchChat;
