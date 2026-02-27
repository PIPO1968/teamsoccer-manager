
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

type LeagueTeamStats = {
  team_id: number;
  team_name: string;
  team_logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string[];
  is_bot: number; // Using number to match database type
};

interface TeamsStatusProps {
  teams: LeagueTeamStats[];
}

const TeamsStatus = ({ teams }: TeamsStatusProps) => {
  const topTeams = [...teams].slice(0, 3);
  const bottomTeams = [...teams].slice(-3);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topTeams.map((team, index) => (
              <Link 
                key={team.team_id} 
                to={`/team/${team.team_id}`}
                className="flex items-center gap-2 hover:bg-accent/50 p-1.5 rounded-md transition-colors"
              >
                <span className="text-sm text-muted-foreground">{index + 1}</span>
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-600 text-white text-[10px]"
                >
                  {team.team_logo || team.team_name.substring(0, 1)}
                </div>
                <span className="text-sm">{team.team_name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{team.points} pts</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bottom Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bottomTeams.map((team, index) => (
              <Link 
                key={team.team_id} 
                to={`/team/${team.team_id}`}
                className="flex items-center gap-2 hover:bg-accent/50 p-1.5 rounded-md transition-colors"
              >
                <span className="text-sm text-muted-foreground">{teams.length - 2 + index}</span>
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center bg-emerald-600 text-white text-[10px]"
                >
                  {team.team_logo || team.team_name.substring(0, 1)}
                </div>
                <span className="text-sm">{team.team_name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{team.points} pts</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamsStatus;
