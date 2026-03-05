
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/services/apiClient';

export type Message = {
  id: number;
  sender_id: number;
  recipient_id: number;
  sender_name: string;
  recipient_name: string;
  subject: string;
  content: string;
  created_at: string;
  read: boolean;
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { manager } = useAuth();

  const fetchMessages = async () => {
    if (!manager) return;
    try {
      const data = await apiFetch<{ success: boolean; messages: Message[]; unreadCount: number }>(
        `/messages?managerId=${manager.user_id}`
      );
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (recipientId: number, subject: string, content: string) => {
    if (!manager) return false;
    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({ senderId: manager.user_id, recipientId, subject, content }),
      });
      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const markAsRead = async (messageId: number) => {
    if (!manager) return false;
    try {
      await apiFetch(`/messages/${messageId}/read`, {
        method: 'PUT',
        body: JSON.stringify({ managerId: manager.user_id }),
      });
      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!manager) return false;
    try {
      await apiFetch(`/messages/${messageId}?managerId=${manager.user_id}`, {
        method: 'DELETE',
      });
      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [manager]);

  return {
    messages,
    unreadCount,
    isLoading,
    sendMessage,
    markAsRead,
    deleteMessage,
    refetch: fetchMessages
  };
};
