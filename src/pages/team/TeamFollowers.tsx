
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamFollowers } from "@/hooks/useTeamFollowers";
import { useAuth } from "@/contexts/AuthContext";

interface TeamFollowersProps {
  teamId: string | undefined;
}

export default function TeamFollowers({ teamId }: TeamFollowersProps) {
  const { followers, followerCount, isFollowing, isLoading, toggleFollow } = useTeamFollowers(teamId);
  const { manager } = useAuth();
  
  // Determine if the current team is the manager's own team
  const isOwnTeam = manager?.team_id === parseInt(teamId || '0');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3">Team Followers</h2>
          <Skeleton className="h-4 w-3/4 mb-3" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-3">Team Followers</h2>
        <div className="text-sm text-muted-foreground mb-4">
          This team has {followerCount} {followerCount === 1 ? 'follower' : 'followers'}.
        </div>
        
        {!isOwnTeam && manager && (
          <Button 
            onClick={toggleFollow}
            className="w-full mb-4"
            variant={isFollowing ? "outline" : "default"}
          >
            <Heart className={`mr-2 h-4 w-4 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
            {isFollowing ? 'Unfollow' : 'Follow'} Team
          </Button>
        )}

        {followers.length > 0 ? (
          <div className="text-sm">
            {followers.map((follower, index) => (
              <React.Fragment key={follower.follower_id}>
                <Link to={`/manager/${follower.follower_id}`} className="text-green-700 hover:underline">
                  {follower.follower_name}
                </Link>
                {index < followers.length - 1 && <span>, </span>}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {/* Empty div to maintain spacing */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
