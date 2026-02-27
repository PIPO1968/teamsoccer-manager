
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMatch } from "@/hooks/useTeamMatches";
import { format, parseISO, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Clock, Settings } from "lucide-react";

interface MatchFeatureBlocksProps {
  latestMatch: TeamMatch | null;
  upcomingMatch: TeamMatch | null;
}

export const MatchFeatureBlocks = ({ latestMatch, upcomingMatch }: MatchFeatureBlocksProps) => {
  const navigate = useNavigate();

  const formatMatchDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "dd MMM yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatMatchTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "";
      return format(date, "HH:mm");
    } catch (error) {
      return "";
    }
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case "Win":
        return "bg-green-50 border-green-200";
      case "Draw":
        return "bg-yellow-50 border-yellow-200";
      case "Loss":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Latest Finished Match */}
      <Card className={`${latestMatch ? getResultColor(latestMatch.result) : 'bg-gray-50 border-gray-200'} h-full flex flex-col`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">⚽</span>
            Latest Match
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          {latestMatch ? (
            <div className="space-y-4 flex flex-col h-full">
              <div className="text-sm text-gray-600">
                {formatMatchDate(latestMatch.match_date)}
              </div>
              <div className="flex items-center justify-center space-x-4 flex-1">
                <div className="text-center">
                  <div className="font-semibold text-lg">{latestMatch.home_team_name}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {latestMatch.home_score} - {latestMatch.away_score}
                  </div>
                  <div className="text-xs text-gray-500">{latestMatch.competition}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{latestMatch.away_team_name}</div>
                </div>
              </div>
              {latestMatch.result && (
                <div className="text-center">
                  <span className={`text-sm font-medium ${
                    latestMatch.result === "Win" ? "text-green-600" :
                    latestMatch.result === "Draw" ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {latestMatch.result}
                  </span>
                </div>
              )}
              <div className="flex justify-center pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/match/${latestMatch.match_id}`)}
                  className="h-8 w-8 p-0"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
              No recent matches found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earliest Upcoming Match */}
      <Card className="bg-blue-50 border-blue-200 h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Next Match
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          {upcomingMatch ? (
            <div className="space-y-4 flex flex-col h-full">
              <div className="text-sm text-gray-600">
                {formatMatchDate(upcomingMatch.match_date)} at {formatMatchTime(upcomingMatch.match_date)}
              </div>
              <div className="flex items-center justify-center space-x-4 flex-1">
                <div className="text-center">
                  <div className="font-semibold text-lg">{upcomingMatch.home_team_name}</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">vs</div>
                  <div className="text-xs text-gray-500">{upcomingMatch.competition}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{upcomingMatch.away_team_name}</div>
                </div>
              </div>
              <div className="flex justify-center space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/match/${upcomingMatch.match_id}/lineup`)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/match/${upcomingMatch.match_id}`)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
              No upcoming matches scheduled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
