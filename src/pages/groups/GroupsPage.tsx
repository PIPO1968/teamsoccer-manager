import { Button } from "@/components/ui/button";
import { useGroups } from "@/hooks/useGroups";
import { useManagerGroups } from "@/hooks/useManagerGroups";
import { useNavigate } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GroupsPage() {
  const { groups, isLoading } = useGroups();
  const { manager } = useAuth();
  const { data: userGroups } = useManagerGroups(manager?.user_id?.toString());
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const otherGroups = groups?.filter(group => 
    !userGroups?.owned.some(g => g.id === group.id) &&
    !userGroups?.member.some(g => g.id === group.id)
  ) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Join or create a group</p>
        </div>
        <Button onClick={() => navigate("/groups/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* User's Groups Section */}
      {(userGroups?.owned.length > 0 || userGroups?.member.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userGroups?.owned.map((group) => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle>{group.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {group.member_count}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {group.description}
                  </p>
                  <Badge variant="default" className="text-xs py-0">
                    Owner
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {userGroups?.member.map((group) => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle>{group.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    {group.member_count}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {group.description}
                  </p>
                  <Badge variant="secondary" className="text-xs py-0">
                    Member
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* List of Groups Section */}
      {otherGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">List of Groups</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherGroups.map((group) => (
                  <TableRow
                    key={group.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    <TableCell>{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="line-clamp-1">{group.description}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.member_count}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
