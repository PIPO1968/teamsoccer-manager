
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface MatchStatsTabProps {
  match: any;
  matchStats: any;
  isCompleted: boolean;
  isUpcoming: boolean;
}

const MatchStatsTab = ({ match, matchStats, isCompleted, isUpcoming }: MatchStatsTabProps) => {
  return (
    <div>
      {!isCompleted ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {isUpcoming 
                ? "Match statistics will be available after the match" 
                : "Match statistics are being compiled"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Complete Match Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {matchStats && (
                <div className="space-y-1">
                  <div className="grid grid-cols-3 text-sm py-2 border-b">
                    <div className="font-medium">{match.home_team_name}</div>
                    <div className="text-center text-muted-foreground">Statistics</div>
                    <div className="text-right font-medium">{match.away_team_name}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm py-2">
                    <div>{matchStats.possession.home}%</div>
                    <div className="text-center">Possession</div>
                    <div className="text-right">{matchStats.possession.away}%</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm py-2">
                    <div>{matchStats.shots.home}</div>
                    <div className="text-center">Shots</div>
                    <div className="text-right">{matchStats.shots.away}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 text-sm py-2">
                    <div>{matchStats.corners.home}</div>
                    <div className="text-center">Corners</div>
                    <div className="text-right">{matchStats.corners.away}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchStatsTab;
