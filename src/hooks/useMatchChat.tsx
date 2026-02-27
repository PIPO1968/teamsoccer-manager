
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MatchChatMessage {
  id: number;
  match_id: number;
  user_id: number;
  username: string;
  message: string;
  created_at: string;
}

export const useMatchChat = (matchId: number) => {
  const [messages, setMessages] = useState<MatchChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('match_chat_messages')
        .select(`
          id,
          match_id,
          user_id,
          message,
          created_at,
          managers(username)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedMessages: MatchChatMessage[] = data?.map(msg => ({
        id: msg.id,
        match_id: msg.match_id,
        user_id: msg.user_id,
        username: (msg.managers as any)?.username || 'Unknown User',
        message: msg.message,
        created_at: msg.created_at
      })) || [];

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string, userId: number) => {
    try {
      const { error } = await supabase
        .from('match_chat_messages')
        .insert({
          match_id: matchId,
          user_id: userId,
          message: message.trim()
        });

      if (error) {
        throw error;
      }

      // Refresh messages after sending
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      // Note: Removed toast notification as requested
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('match-chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_chat_messages',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
