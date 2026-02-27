import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useManagerId } from "@/hooks/useManagerId"; 
import { useLocation } from "react-router-dom";

// Create a shared array to store online user data that can be accessed across components
let globalOnlineUserData: Array<{ user_id: number; current_url?: string }> = [];

export const useOnlinePlayers = () => {
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([]);
  const [onlineUserData, setOnlineUserData] = useState<Array<{ user_id: number; current_url?: string }>>(globalOnlineUserData);
  const [isLoading, setIsLoading] = useState(true);
  const { managerId } = useManagerId();
  const location = useLocation();

  useEffect(() => {
    // Create a channel for presence tracking with a unique name to ensure consistency
    const channel = supabase.channel('online-users-global');
    
    // Add presence event handlers
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const totalOnline = Object.keys(presenceState).length;
      
      // Extract user IDs and URLs from presence state
      const userIds: number[] = [];
      const userData: Array<{ user_id: number; current_url?: string }> = [];
      
      Object.values(presenceState).forEach((presences: any[]) => {
        presences.forEach(presence => {
          if (presence.user_id) {
            userIds.push(presence.user_id);
            userData.push({
              user_id: presence.user_id,
              current_url: presence.current_url
            });
          }
        });
      });
      
      // Update global shared state
      globalOnlineUserData = userData;
      
      // Update component state
      setOnlinePlayers(totalOnline);
      setOnlineUserIds(userIds);
      setOnlineUserData(userData);
      setIsLoading(false);
    });
    
    // Actually subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && managerId) {
        // Track the current user's presence with URL
        await channel.track({
          user_id: managerId,
          online_at: new Date().toISOString(),
          current_url: location.pathname,
        });
        
        // Ping every 60 seconds (1 minute) to keep the presence alive
        const pingInterval = setInterval(async () => {
          if (managerId) {
            await channel.track({
              user_id: managerId,
              online_at: new Date().toISOString(),
              current_url: location.pathname,
            });
          }
        }, 60000); // Changed from 30000 (30 seconds) to 60000 (60 seconds)
        
        return () => clearInterval(pingInterval);
      }
    });

    // Cleanup function to remove channel
    return () => {
      supabase.removeChannel(channel);
    };
  }, [managerId]);

  // Update presence when location changes
  useEffect(() => {
    if (managerId) {
      const channel = supabase.channel('online-users-global');
      channel.track({
        user_id: managerId,
        online_at: new Date().toISOString(),
        current_url: location.pathname,
      });
    }
  }, [location.pathname, managerId]);

  return { onlinePlayers, onlineUserIds, onlineUserData, isLoading };
};
