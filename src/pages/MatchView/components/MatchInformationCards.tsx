
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { MatchDetails } from "@/hooks/useMatchDetails";
import { format, parseISO, isValid } from "date-fns";

interface MatchInformationCardsProps {
  match: MatchDetails;
}

const MatchInformationCards = ({ match }: MatchInformationCardsProps) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formatMatchDate(match.match_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{formatMatchTime(match.match_date)}</span>
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
            <p className="font-medium">
              <Link 
                to={`/stadium/${match.stadium_id}`} 
                className="hover:underline"
              >
                {match.stadium_name || `${match.home_team_name} Stadium`}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">Capacity: 15,000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchInformationCards;
