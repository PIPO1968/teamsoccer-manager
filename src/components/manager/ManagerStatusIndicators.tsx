
import { Star, Shield } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useManagerStatus } from "@/hooks/useManagerStatus";

interface ManagerStatusIndicatorsProps {
  managerId: number;
  isPremium: number;
  isAdmin?: number;
}

export function ManagerStatusIndicators({ managerId, isPremium, isAdmin }: ManagerStatusIndicatorsProps) {
  const { is_online, last_seen } = useManagerStatus(managerId);
  
  const getAdminLabel = (isAdmin: number) => {
    switch (isAdmin) {
      case 4: return 'Developer';
      case 3: return 'Staff';
      case 2: return 'Admin';
      case 1: return 'Moderator';
      default: return '';
    }
  };

  const getPremiumLabel = (isPremium: number) => {
    switch (isPremium) {
      case 1: return 'Premium Member';
      default: return '';
    }
  };

  // Check if we should show admin status
  const shouldShowAdmin = Boolean(isAdmin && isAdmin > 0 && getAdminLabel(isAdmin));
  
  // Check if we should show premium status
  const shouldShowPremium = Boolean(isPremium && isPremium > 0 && getPremiumLabel(isPremium));
  
  // Don't render anything if no statuses to show
  if (!shouldShowAdmin && !shouldShowPremium) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {shouldShowAdmin && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Shield className="h-4 w-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              {getAdminLabel(isAdmin!)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {shouldShowPremium && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </TooltipTrigger>
            <TooltipContent>
              {getPremiumLabel(isPremium)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
