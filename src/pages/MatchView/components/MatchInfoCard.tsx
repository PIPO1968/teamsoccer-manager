
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Play } from "lucide-react";
import { MatchDetails } from "@/hooks/useMatchDetails";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface MatchInfoCardProps {
  match: MatchDetails;
  matchId?: string;
}

const MatchInfoCard = ({ match, matchId }: MatchInfoCardProps) => {
  const navigate = useNavigate();
  
  const formatMatchDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };
  
  const formatMatchTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "";
      return format(date, "HH:mm");
    } catch (error) {
      return "";
    }
  };
  
  const startMatchSimulation = () => {
    toast({
      title: "Match Report",
      description: "Loading match report...",
      duration: 2000,
    });
    navigate(`/match-viewer/${matchId}`);
  };

  const isUpcoming = match.status === 'scheduled';
  const isCompleted = match.status === 'completed';
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <Badge variant={isUpcoming ? "outline" : isCompleted ? "default" : "secondary"}>
              {isUpcoming ? "Upcoming" : isCompleted ? "Completed" : "In Progress"}
            </Badge>
            <h2 className="text-xl font-semibold mt-2">{match.competition}</h2>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center justify-end gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatMatchDate(match.match_date)}</span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-1">
              <Clock className="h-4 w-4" />
              <span>{formatMatchTime(match.match_date)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-10">
          <div className="flex justify-center items-center space-x-8 md:space-x-16">
            <div className="text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: '#059669' }}
              >
                {match.home_team_logo ? (
                  <img 
                    src={match.home_team_logo} 
                    alt={match.home_team_name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{match.home_team_name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <p className="mt-3 font-medium">
                <Link 
                  to={`/team/${match.home_team_id}`} 
                  className="hover:underline"
                >
                  {match.home_team_name}
                </Link>
              </p>
              {isCompleted && (
                <span className="text-4xl font-bold block mt-2">{match.home_score}</span>
              )}
            </div>
            
            <div className="text-center">
              {isCompleted ? (
                <div className="w-16 h-16 flex items-center justify-center">
                  <span className="text-4xl font-bold">-</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-lg font-medium">vs</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {formatMatchTime(match.match_date)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <div 
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: '#dc2626' }}
              >
                {match.away_team_logo ? (
                  <img 
                    src={match.away_team_logo} 
                    alt={match.away_team_name} 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{match.away_team_name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <p className="mt-3 font-medium">
                <Link 
                  to={`/team/${match.away_team_id}`} 
                  className="hover:underline"
                >
                  {match.away_team_name}
                </Link>
              </p>
              {isCompleted && (
                <span className="text-4xl font-bold block mt-2">{match.away_score}</span>
              )}
            </div>
          </div>

          <div className="mt-8">
            {!isUpcoming && isCompleted ? (
              <Button onClick={startMatchSimulation} variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Match Report
              </Button>
            ) : !isUpcoming ? (
              <Button disabled variant="outline">
                Match In Progress
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchInfoCard;
