
import { format, parseISO, isValid } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
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
  // Formatea la fecha y hora en la zona horaria local del país local
  const formatLocalDateTime = (dateString: string, timezone: string) => {
    try {
      const utcDate = parseISO(dateString);
      if (!isValid(utcDate)) return { date: "Invalid date", time: "" };
      const zoned = toZonedTime(utcDate, timezone);
      return {
        date: formatTz(zoned, "dd MMM yyyy", { timeZone: timezone }),
        time: formatTz(zoned, "HH:mm", { timeZone: timezone })
      };
    } catch {
      return { date: "Invalid date", time: "" };
    }
  };

  // Calcula la diferencia horaria respecto a Inglaterra (Europe/London)
  const getTimeDiffLabel = (timezone) => {
    try {
      const utcDate = new Date();
      const baseOffset = -toZonedTime(utcDate, "Europe/London").getTimezoneOffset();
      const localOffset = -toZonedTime(utcDate, timezone).getTimezoneOffset();
      const diff = (localOffset - baseOffset) / 60;
      if (diff === 0) return "(UK time)";
      if (diff > 0) return `(+${diff}h vs UK)`;
      return `(${diff}h vs UK)`;
    } catch {
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
    const { date, time } = formatLocalDateTime(match.match_date, match.home_timezone);
    const diffLabel = getTimeDiffLabel(match.home_timezone);
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
                <p className="text-xs text-blue-700 mt-1">
                  {date} {time} <span className="text-gray-500">{match.home_country_name}</span> <span className="text-gray-400">{diffLabel}</span>
                </p>
              </div>
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
              <div className={`rounded-full p-2 ${match.result === "Win" ? "bg-green-100" :
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
