
import { format } from "date-fns";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { GroupMember } from "@/hooks/useGroupMembers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupMembersProps {
  members: GroupMember[];
}

export function GroupMembers({ members }: GroupMembersProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Members</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member: GroupMember) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="font-medium">
                  <Link 
                    to={`/manager/${member.manager_id}`}
                    className="hover:underline text-primary"
                  >
                    {member.manager?.username || 'Unknown'}
                  </Link>
                  {member.role === 'owner' && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Owner
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Joined {format(new Date(member.joined_at), 'PP')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
