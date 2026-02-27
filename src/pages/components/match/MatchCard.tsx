
import { format, parseISO, isValid } from "date-fns";
import { ArrowRight, Calendar, Eye, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamMatch } from "@/hooks/useTeamMatches";

interface MatchCardProps {
  match: TeamMatch;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();

  // Function to get color based on result
  const getResultColor = (result: string | null) => {
    switch (result) {
      case "Win":
        return "text-green-500";
      case "Draw":
        return "text-yellow-500";
      case "Loss":
        return "text-red-500";
      default:
        return "";
    }
  };

  // Function to format dates
  const formatMatchDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      
      if (date.toDateString() === now.toDateString()) {
        return "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return format(date, "MMM d, yyyy");
      }
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

  const viewMatchDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/match/${match.match_id}`);
  };
  
  const setupLineup = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/match/${match.match_id}/lineup`);
  };

  if (match.status === 'scheduled') {
    return (
      <Card className="hover:bg-accent/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="bg-accent rounded-full p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className={`font-medium ${match.is_home ? "text-primary" : ""}`}>
                    {match.home_team_name}
                  </span>
                  <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                  <span className={`font-medium ${!match.is_home ? "text-primary" : ""}`}>
                    {match.away_team_name}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{match.competition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatMatchDate(match.match_date)}</div>
              <div className="text-sm text-muted-foreground">{formatMatchTime(match.match_date)}</div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={viewMatchDetails}>
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="default" size="sm" onClick={setupLineup}>
              <Settings className="h-4 w-4 mr-2" />
              Lineup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card className="hover:bg-accent/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className={`rounded-full p-2 ${
                match.result === "Win" ? "bg-green-100" : 
                match.result === "Draw" ? "bg-yellow-100" : "bg-red-100"
              }`}>
                <span className={`font-semibold ${getResultColor(match.result)}`}>
                  {match.result === "Win" ? "W" : match.result === "Draw" ? "D" : "L"}
                </span>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-medium">{match.home_team_name}</span>
                  <span className="mx-2">{match.home_score} - {match.away_score}</span>
                  <span className="font-medium">{match.away_team_name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{match.competition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatMatchDate(match.match_date)}</div>
              <div className={`text-sm ${getResultColor(match.result)}`}>{match.result}</div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-3">
            <Button variant="outline" size="sm" onClick={viewMatchDetails}>
              <Eye className="h-4 w-4 mr-2" />
              Match Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
};
