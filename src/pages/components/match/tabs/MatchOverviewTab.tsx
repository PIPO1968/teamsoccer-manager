
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin } from "lucide-react";

interface MatchOverviewTabProps {
  match: any;
  matchStats: any;
  isCompleted: boolean;
}

const MatchOverviewTab = ({ match, matchStats, isCompleted }: MatchOverviewTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Match Information</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Competition</span>
                <span className="font-medium">{match.competition}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{match.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Venue</CardTitle>
          </CardHeader>
          <CardContent className="py-1">
            <div className="text-center py-4">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">{match.home_team_name} Stadium</p>
              <p className="text-sm text-muted-foreground">Capacity: 15,000</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isCompleted && matchStats && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{matchStats.possession.home}%</span>
                  <span className="text-muted-foreground">Possession</span>
                  <span className="font-medium">{matchStats.possession.away}%</span>
                </div>
                <Progress value={matchStats.possession.home} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 text-sm">
                <div className="text-center font-medium">{matchStats.shots.home}</div>
                <div className="text-center text-muted-foreground">Shots</div>
                <div className="text-center font-medium">{matchStats.shots.away}</div>
              </div>
              
              <div className="grid grid-cols-3 text-sm">
                <div className="text-center font-medium">{matchStats.corners.home}</div>
                <div className="text-center text-muted-foreground">Corners</div>
                <div className="text-center font-medium">{matchStats.corners.away}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchOverviewTab;
