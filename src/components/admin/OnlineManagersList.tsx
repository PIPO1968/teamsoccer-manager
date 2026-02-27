
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OnlineManagerCard } from "./OnlineManagerCard";

interface OnlineManager {
  user_id: number;
  username: string;
  is_admin: number;
  is_premium: number;
  last_login: string;
  country_name?: string;
  current_url?: string;
}

interface OnlineManagersListProps {
  managers: OnlineManager[];
  loading: boolean;
}

export const OnlineManagersList = ({ managers, loading }: OnlineManagersListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No managers are currently online</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {managers.map((manager) => (
        <OnlineManagerCard key={manager.user_id} manager={manager} />
      ))}
    </div>
  );
};
