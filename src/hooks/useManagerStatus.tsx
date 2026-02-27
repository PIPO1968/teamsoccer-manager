
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useOnlinePlayers } from "@/hooks/useOnlinePlayers";

interface ManagerStatus {
  is_online: boolean;
  last_seen: string | null;
}

// Create a global cache to store online status across components
const onlineStatusCache: Record<number, boolean> = {};

export const useManagerStatus = (managerId: number | undefined) => {
  const [status, setStatus] = useState<ManagerStatus>({
    is_online: false,
    last_seen: null
  });
  const { onlineUserIds } = useOnlinePlayers();

  useEffect(() => {
    if (!managerId) {
      setStatus({
        is_online: false,
        last_seen: null
      });
      return;
    }

    // Check if the manager is in the active online users list from presence
    const isCurrentlyOnline = onlineUserIds.includes(managerId);
    
    // Update the global cache
    if (isCurrentlyOnline) {
      onlineStatusCache[managerId] = true;
      setStatus({
        is_online: true,
        last_seen: format(new Date(), 'PPpp')
      });
      return;
    } else {
      // Manager is not online according to presence, remove from cache
      delete onlineStatusCache[managerId];
    }

    // If not currently online based on presence, fall back to the database check
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .rpc('get_manager_online_status', { manager_id: managerId });

      if (!error && data?.[0]) {
        setStatus({
          is_online: data[0].is_online,
          last_seen: data[0].last_seen ? format(new Date(data[0].last_seen), 'PPpp') : null
        });
      } else {
        setStatus({
          is_online: false,
          last_seen: null
        });
      }
    };

    fetchStatus();
  }, [managerId, onlineUserIds]);

  return status;
};
