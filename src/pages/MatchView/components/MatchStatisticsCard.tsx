
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MatchDetails } from "@/hooks/useMatchDetails";

interface MatchStatisticsCardProps {
  match: MatchDetails;
  matchStats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
  };
}

const MatchStatisticsCard = ({ match, matchStats }: MatchStatisticsCardProps) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Match Statistics</CardTitle>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-sm py-2 border-b">
              <div className="font-medium">{match.home_team_name}</div>
              <div className="text-center text-muted-foreground">Statistics</div>
              <div className="text-right font-medium">{match.away_team_name}</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{matchStats.possession.home}%</span>
                <span className="text-muted-foreground">Possession</span>
                <span className="font-medium">{matchStats.possession.away}%</span>
              </div>
              <Progress
                value={matchStats.possession.home}
                className="h-2"
              />
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{matchStats.shots.home}</div>
              <div className="text-center">Shots</div>
              <div className="text-right">{matchStats.shots.away}</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{matchStats.shotsOnTarget.home}</div>
              <div className="text-center">Shots on target</div>
              <div className="text-right">{matchStats.shotsOnTarget.away}</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{matchStats.corners.home}</div>
              <div className="text-center">Corners</div>
              <div className="text-right">{matchStats.corners.away}</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{matchStats.fouls.home}</div>
              <div className="text-center">Fouls</div>
              <div className="text-right">{matchStats.fouls.away}</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{Math.floor(Math.random() * 5)}</div>
              <div className="text-center">Yellow Cards</div>
              <div className="text-right">{Math.floor(Math.random() * 4)}</div>
            </div>
            
            <div className="grid grid-cols-3 text-sm py-2">
              <div>{Math.floor(Math.random() * 2)}</div>
              <div className="text-center">Red Cards</div>
              <div className="text-right">{Math.floor(Math.random() * 2)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchStatisticsCard;
