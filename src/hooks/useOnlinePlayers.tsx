import { useMemo } from "react";

export const useOnlinePlayers = () => {
  const onlinePlayers = 0;
  const onlineUserIds = useMemo<number[]>(() => [], []);
  const onlineUserData = useMemo<Array<{ user_id: number; current_url?: string }>>(
    () => [],
    []
  );
  const isLoading = false;

  return { onlinePlayers, onlineUserIds, onlineUserData, isLoading };
};
