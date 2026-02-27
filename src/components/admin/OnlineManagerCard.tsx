
import { Link } from "react-router-dom";
import { Clock, Eye, MapPin } from "lucide-react";
import { AdminBadge, PremiumBadge } from "./OnlineManagerBadges";
import { formatLastLogin, formatCurrentLocation } from "@/utils/admin/onlineManagerUtils";

interface OnlineManager {
  user_id: number;
  username: string;
  is_admin: number;
  is_premium: number;
  last_login: string;
  country_name?: string;
  current_url?: string;
}

interface OnlineManagerCardProps {
  manager: OnlineManager;
}

export const OnlineManagerCard = ({ manager }: OnlineManagerCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {manager.username.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to={`/manager/${manager.user_id}`}
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              {manager.username}
            </Link>
            {manager.is_premium === 1 && <PremiumBadge />}
            <AdminBadge adminLevel={manager.is_admin} />
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last seen: {formatLastLogin(manager.last_login)}
              {manager.country_name && (
                <>
                  <span className="mx-1">•</span>
                  <span>{manager.country_name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Currently viewing: <span className="font-medium">{formatCurrentLocation(manager.current_url)}</span>
            </div>
          </div>
        </div>
      </div>

      <Link 
        to={`/manager/${manager.user_id}`}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
      >
        <Eye className="h-4 w-4" />
        View Profile
      </Link>
    </div>
  );
};
