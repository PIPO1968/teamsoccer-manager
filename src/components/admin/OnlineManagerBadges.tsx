
import { Badge } from "@/components/ui/badge";

interface AdminBadgeProps {
  adminLevel: number;
}

export const AdminBadge = ({ adminLevel }: AdminBadgeProps) => {
  if (adminLevel === 0) return null;
  
  const badgeColors = {
    1: "bg-blue-100 text-blue-800",
    2: "bg-purple-100 text-purple-800", 
    3: "bg-red-100 text-red-800"
  };

  const badgeLabels = {
    1: "Staff",
    2: "Admin", 
    3: "Super Admin"
  };

  return (
    <Badge className={badgeColors[adminLevel as keyof typeof badgeColors] || "bg-gray-100 text-gray-800"}>
      {badgeLabels[adminLevel as keyof typeof badgeLabels] || `Admin ${adminLevel}`}
    </Badge>
  );
};

export const PremiumBadge = () => (
  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
    Premium
  </Badge>
);
