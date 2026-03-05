
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/apiClient";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { Link } from "react-router-dom";
import { ManagerStatusIndicators } from "@/components/manager/ManagerStatusIndicators";
import { useManagerStatus } from "@/hooks/useManagerStatus";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { useAvatarConfig } from "@/hooks/useAvatarConfig";

interface PostUserInfoProps {
  userId: number;
  createdAt: string;
}

export default function PostUserInfo({ userId, createdAt }: PostUserInfoProps) {
  const [managerInfo, setManagerInfo] = useState<{
    manager_name: string;
    team_name: string;
    team_id: number | null;
    is_admin: number;
    is_premium: number;
  }>({
    manager_name: "Unknown Manager",
    team_name: "No Team",
    team_id: null,
    is_admin: 0,
    is_premium: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const { league } = useTeamLeague(managerInfo.team_id?.toString());
  const { is_online, last_seen } = useManagerStatus(userId);
  const { avatarConfig } = useAvatarConfig(userId);

  const formattedDate = createdAt ? format(new Date(createdAt), "PPp") : "";

  useEffect(() => {
    const fetchUserTeamInfo = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{ success: boolean; manager: any }>(
          `/managers/${userId}/profile`
        );
        const m = data.manager;
        const team = m?.teams?.[0];
        setManagerInfo({
          manager_name: m?.username || "Unknown Manager",
          team_name: team?.name || "No Team",
          team_id: team?.team_id || null,
          is_admin: m?.is_admin || 0,
          is_premium: m?.is_premium || 0
        });
      } catch (error) {
        console.error("Error fetching user team info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTeamInfo();
  }, [userId]);

  const getAdminPrefix = (isAdmin: number) => {
    switch (isAdmin) {
      case 4: return 'DEV-';
      case 3: return 'STAFF-';
      case 2: return 'ADMIN-';
      case 1: return 'MOD-';
      default: return '';
    }
  };

  const displayName = managerInfo.is_admin > 0
    ? `${getAdminPrefix(managerInfo.is_admin)}${managerInfo.manager_name}`
    : managerInfo.manager_name;

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="bg-card p-3 rounded-lg border shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="text-right flex flex-col space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <Link
                to={`/manager/${userId}`}
                className="hover:underline font-medium"
              >
                {displayName}
              </Link>
              <ManagerStatusIndicators
                managerId={userId}
                isPremium={managerInfo.is_premium || 0}
                isAdmin={managerInfo.is_admin || 0}
              />
            </div>
            {managerInfo.team_id && (
              <Link
                to={`/team/${managerInfo.team_id}`}
                className="text-sm hover:underline text-muted-foreground"
              >
                {managerInfo.team_name}
              </Link>
            )}
            {league ? (
              <Link
                to={`/series/${league.series_id}`}
                className="text-xs hover:underline text-muted-foreground"
              >
                {league.region_name} {toRomanNumeral(league.division)}.{league.group_number}
              </Link>
            ) : managerInfo.team_id ? (
              <span className="text-xs text-muted-foreground">
                No league information
              </span>
            ) : null}
            <div className="text-xs">
              {is_online ? (
                <span className="text-green-600 font-medium">● Online now</span>
              ) : (
                <span className="text-gray-500">
                  Last seen: {last_seen || 'Unknown'}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200">
              <AvatarDisplay
                config={avatarConfig}
                size="sm"
                className="h-full w-full"
              />
            </div>
            {/* Online Status Indicator */}
            {is_online && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toRomanNumeral(num: number): string {
  const romanNumerals: { [key: number]: string } = {
    1000: 'M',
    900: 'CM',
    500: 'D',
    400: 'CD',
    100: 'C',
    90: 'XC',
    50: 'L',
    40: 'XL',
    10: 'X',
    9: 'IX',
    5: 'V',
    4: 'IV',
    1: 'I'
  };

  let result = '';
  for (const value of Object.keys(romanNumerals).map(Number).sort((a, b) => b - a)) {
    while (num >= value) {
      result += romanNumerals[value];
      num -= value;
    }
  }
  return result;
}
