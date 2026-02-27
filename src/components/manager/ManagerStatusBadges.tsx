
import { Badge } from "@/components/ui/badge";
import { Crown, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ManagerStatusBadges = () => {
  const { isPremium, isWaitingList } = useAuth();

  return (
    <div className="flex gap-2">
      {isPremium && (
        <Badge variant="default" className="bg-yellow-600 hover:bg-yellow-700">
          <Crown className="w-3 h-3 mr-1" />
          Premium Member
        </Badge>
      )}
      {isWaitingList && (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
          <Clock className="w-3 h-3 mr-1" />
          In Waiting List
        </Badge>
      )}
    </div>
  );
};

export default ManagerStatusBadges;
