
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import { useManagerFollowedTeams } from "@/hooks/useManagerFollowedTeams";
import { useManagerEvents } from "@/hooks/useManagerEvents";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagerStatsProps {
  managerId: string | undefined;
}

export function ManagerStats({ managerId }: ManagerStatsProps) {
  const { followedTeams, isLoading: followedTeamsLoading } = useManagerFollowedTeams(managerId);
  const { data: events = [], isLoading: eventsLoading } = useManagerEvents(managerId);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4" />
            Favorite Teams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {followedTeamsLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : followedTeams.length > 0 ? (
            <div className="text-sm">
              {followedTeams.map((team, index) => (
                <React.Fragment key={team.team_id}>
                  <Link 
                    to={`/team/${team.team_id}`} 
                    className="text-green-700 hover:underline"
                  >
                    {team.team_name}
                  </Link>
                  {index < followedTeams.length - 1 && <span>, </span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No favorite teams added yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4" />
            Latest Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <Skeleton className="h-4 w-full" />
          ) : events.length > 0 ? (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="text-sm">
                  <span className="text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString()}:
                  </span>{' '}
                  {event.event_description}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No important recent events</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
