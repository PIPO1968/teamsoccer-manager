
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useManagerGroups } from "@/hooks/useManagerGroups";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagerRoomsProps {
  managerId: string | undefined;
}

export function ManagerRooms({ managerId }: ManagerRoomsProps) {
  const { data: groupsData, isLoading } = useManagerGroups(managerId);
  
  const allGroups = [...(groupsData?.owned || []), ...(groupsData?.member || [])];
  const hasGroups = allGroups.length > 0;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Rooms
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : hasGroups ? (
          <div className="space-y-2">
            {allGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between">
                <Link to={`/rooms/${group.id}`} className="text-sm hover:underline">
                  {group.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {group.member_count} member{group.member_count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">This manager is not part of any room.</p>
        )}
      </CardContent>
    </Card>
  );
}
