
import { useState, useEffect } from 'react';
import { apiFetch } from '@/services/apiClient';

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
      const data = await apiFetch<{ success: boolean; messages: MatchChatMessage[] }>(
        `/matches/${matchId}/chat`
      );
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string, userId: number) => {
    try {
      await apiFetch(`/matches/${matchId}/chat`, {
        method: 'POST',
        body: JSON.stringify({ userId, message }),
      });
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  return { messages, isLoading, error, sendMessage, refreshMessages: fetchMessages };
};
