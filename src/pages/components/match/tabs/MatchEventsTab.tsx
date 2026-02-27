
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";

interface MatchEventsTabProps {
  match: any;
  highlights: any[];
  isCompleted: boolean;
  isUpcoming: boolean;
}

const MatchEventsTab = ({ match, highlights, isCompleted, isUpcoming }: MatchEventsTabProps) => {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Match Events</CardTitle>
      </CardHeader>
      <CardContent>
        {!isCompleted ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {isUpcoming 
                ? "The match hasn't started yet" 
                : "Match events will appear here"}
            </p>
          </div>
        ) : highlights.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No events recorded for this match</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {highlights.map((event, index) => (
              <div 
                key={index}
                className={`p-3 rounded-md border-l-4 ${
                  event.event_type === 'goal' ? 'border-green-500 bg-green-50' :
                  event.event_type === 'yellow_card' ? 'border-yellow-500 bg-yellow-50' : 
                  event.event_type === 'red_card' ? 'border-red-500 bg-red-50' :
                  event.event_type === 'injury' ? 'border-red-300 bg-red-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-start">
                  <div className="bg-white border rounded px-2 py-0.5 text-sm font-medium mr-3">
                    {event.minute}'
                  </div>
                  <div>
                    <p className="font-medium">
                      {event.event_type === 'goal' && '⚽ '}
                      {event.event_type === 'yellow_card' && '🟨 '}
                      {event.event_type === 'red_card' && '🟥 '}
                      {event.event_type === 'injury' && '🩹 '}
                      {event.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.team === 'home' ? match.home_team_name : match.away_team_name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchEventsTab;
