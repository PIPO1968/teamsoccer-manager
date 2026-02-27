
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Crown } from "lucide-react";
import { useManagerProfile } from "@/hooks/useManagerProfile";
import { useManagerFollowedTeams } from "@/hooks/useManagerFollowedTeams";
import { Skeleton } from "@/components/ui/skeleton";
import ManagerStatusBadges from "@/components/manager/ManagerStatusBadges";
import { useAuth } from "@/contexts/AuthContext";
import { ManagerProfile } from "@/pages/manager/ManagerProfile";
import { ManagerRooms } from "@/pages/manager/ManagerRooms";
import { ManagerStats } from "@/pages/manager/ManagerStats";
import { Link } from "react-router-dom";
import React from 'react';

const Manager = () => {
  const { managerId } = useParams();
  const { manager: currentManager } = useAuth();
  const { data: manager, isLoading, error } = useManagerProfile(managerId ? parseInt(managerId) : null);
  const { followedTeams, isLoading: followedTeamsLoading } = useManagerFollowedTeams(managerId);
  
  const isCurrentManager = currentManager?.user_id === parseInt(managerId || '0');

  // Get 5 random teams from followed teams
  const getRandomTeams = (teams: typeof followedTeams, count: number = 5) => {
    if (teams.length <= count) return teams;
    const shuffled = [...teams].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const randomFollowedTeams = getRandomTeams(followedTeams);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manager Not Found</h1>
        <p className="text-gray-600">The manager profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{manager.username}</h1>
          <p className="text-muted-foreground">Manager Profile</p>
        </div>
        <div className="flex flex-col items-end gap-4">
          {isCurrentManager && <ManagerStatusBadges />}
        </div>
      </div>

      {manager.status === 'waiting_list' && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Waiting List Status</CardTitle>
            <CardDescription>
              This manager is currently on the waiting list for team assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Managers on the waiting list have limited access to the game while we prepare 
              the full team management experience. They can participate in forums and explore 
              the community features.
            </p>
          </CardContent>
        </Card>
      )}

      <ManagerProfile 
        managerProfile={{
          username: manager.username,
          email: manager.email,
          is_admin: manager.is_admin,
          user_id: manager.user_id,
          country_id: manager.country_id,
          country_name: manager.country_name,
          is_premium: manager.is_premium,
          premium_expires_at: manager.premium_expires_at,
          status: manager.status,
          created_at: manager.created_at,
          teams: manager.teams
        }}
        isOwnProfile={isCurrentManager}
      />

      {/* 3-column layout for Rooms, Favorite Teams, and Latest Events */}
      <div className="grid gap-6 md:grid-cols-3">
        <ManagerRooms managerId={managerId} />
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4" />
              Favorite Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followedTeamsLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : followedTeams.length > 0 ? (
              <div>
                <div className="text-sm mb-2">
                  {randomFollowedTeams.map((team, index) => (
                    <React.Fragment key={team.team_id}>
                      <Link 
                        to={`/team/${team.team_id}`} 
                        className="text-green-700 hover:underline"
                      >
                        {team.team_name}
                      </Link>
                      {index < randomFollowedTeams.length - 1 && <span>, </span>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  (showing {Math.min(5, followedTeams.length)} random out of {followedTeams.length})
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No favorite teams added yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Latest Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* This will be populated by ManagerStats events logic */}
            <p className="text-sm text-muted-foreground">No important recent events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Manager;
