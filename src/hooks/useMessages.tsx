
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .rpc('get_manager_messages', {
          p_manager_id: manager.user_id
        });

      if (error) throw error;
      setMessages(data || []);

      // Get unread count
      const { data: countData, error: countError } = await supabase
        .rpc('get_unread_message_count', {
          p_manager_id: manager.user_id
        });

      if (countError) throw countError;
      setUnreadCount(countData || 0);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (recipientId: number, subject: string, content: string) => {
    if (!manager) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: manager.user_id,
          recipient_id: recipientId,
          subject,
          content
        });

      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const markAsRead = async (messageId: number) => {
    if (!manager) return;

    try {
      const { data, error } = await supabase
        .rpc('mark_message_as_read', {
          p_message_id: messageId,
          p_manager_id: manager.user_id
        });

      if (error) throw error;
      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!manager) return;

    try {
      const { data, error } = await supabase
        .rpc('delete_message', {
          p_message_id: messageId,
          p_manager_id: manager.user_id
        });

      if (error) throw error;
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
