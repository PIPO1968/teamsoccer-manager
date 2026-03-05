import { useMemo } from "react";
import { useWorldStats } from "./useWorldStats";

export const useOnlinePlayers = () => {
  const { stats, isLoading } = useWorldStats();

  const onlinePlayers = stats?.onlineManagers ?? 0;
  const totalManagers = stats?.totalManagers ?? 0;
  const onlineUserIds = useMemo<number[]>(() => [], []);
  const onlineUserData = useMemo<Array<{ user_id: number; current_url?: string }>>(
    () => [],
    []
  );

  return { onlinePlayers, totalManagers, onlineUserIds, onlineUserData, isLoading };
};
