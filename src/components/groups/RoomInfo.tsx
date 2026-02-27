
import { format } from "date-fns";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Group } from "@/hooks/useGroups";
import { GroupMember } from "@/hooks/useGroupMembers";
import { GroupLogoUpload } from "./GroupLogoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface RoomInfoProps {
  group: Group;
  members: GroupMember[] | undefined;
  isOwner: boolean;
  onDeleteClick: () => void;
}

export function RoomInfo({ group, members, isOwner, onDeleteClick }: RoomInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle>{group.name}</CardTitle>
        {isOwner && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDeleteClick}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete Room
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-[300px]">
            <div className="w-full h-[300px] bg-white rounded-lg border-2 flex items-center justify-center overflow-hidden">
              {group.club_logo ? (
                <img 
                  src={group.club_logo} 
                  alt={`${group.name} logo`} 
                  className="max-w-[300px] max-h-[300px] object-contain" 
                />
              ) : (
                <div className="rounded-full w-20 h-20 bg-emerald-600 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            {isOwner && (
              <div className="mt-4">
                <GroupLogoUpload group={group} />
              </div>
            )}
          </div>
          
          <div className="w-full md:w-2/3 space-y-6">
            <p className="text-muted-foreground">{group.description}</p>
            
            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex justify-between border-b pb-2">
                <span>Created</span>
                <span>{format(new Date(group.created_at), 'PPp')}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Members</span>
                <span>{group?.accurate_member_count}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Owner</span>
                <Link 
                  to={`/manager/${group.owner_id}`}
                  className="hover:underline text-primary"
                >
                  {members?.find(m => m.manager_id === group.owner_id)?.manager?.username || 'Unknown'}
                </Link>
              </div>
              {group.forum_id && (
                <div className="flex justify-between border-b pb-2">
                  <span>Forum</span>
                  <Link 
                    to={`/forum/${group.forum_id}`}
                    className="hover:underline text-primary"
                  >
                    View Forum
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
