
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import { useTeamData } from "@/hooks/useTeamData";
import RecentVisitors from "./RecentVisitors";
import { TeamAwards } from "./TeamAwards";
import TeamFollowers from "./TeamFollowers";
import { ChallengeButton } from "@/components/challenges/ChallengeButton";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const TeamSidebar = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { team, isLoading } = useTeamData(teamId);
  const { manager } = useAuth();
  
  // Check if this is the user's own team
  const isOwnTeam = team?.is_bot === 0 && manager && String(team?.manager_id) === String(manager.user_id);
  
  return (
    <div className="space-y-4">
      {!isOwnTeam && team && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3">Quick Links</h2>
            <div className="space-y-2">
              <Link 
                to={`/team/${team.team_id}/players`}
                className="text-green-700 hover:underline block"
              >
                View Team Players
              </Link>
              {team.is_bot === 0 && manager && (
                <div>
                  <ChallengeButton 
                    teamId={manager?.team_id?.toString() || ""} 
                    challengedTeamId={team.team_id} 
                    challengedTeamName={team.name} 
                    isBot={team.is_bot} 
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3">More Info</h2>
          <div className="space-y-2">
            <Link 
              to={`/flags/${teamId}`}
              className="text-green-700 hover:underline block"
            >
              View Flag Collection
            </Link>
          </div>
        </CardContent>
      </Card>

      <TeamAwards teamId={teamId} />
      
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3">Team Stats</h2>
          {isLoading ? (
            <p>Loading team stats...</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team Rating</span>
                <span className="font-medium">{team?.team_rating || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Morale</span>
                <span className="font-medium">{team?.team_morale || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fans</span>
                <span className="font-medium">{team?.fan_count?.toLocaleString() || '-'}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recent Form</span>
                <div className="flex gap-1">
                  {team?.form?.slice(0, 5).map((result, i) => (
                    <span 
                      key={i} 
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                        result === 'W' ? 'bg-green-500 text-white' :
                        result === 'L' ? 'bg-red-500 text-white' :
                        'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamFollowers teamId={teamId} />

      <RecentVisitors teamId={teamId} />
    </div>
  );
}

export default TeamSidebar;
