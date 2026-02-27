
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StadiumMatch } from "@/hooks/useStadiumMatches";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

interface StadiumMatchesSectionProps {
  title: string;
  matches: StadiumMatch[];
  emptyMessage: string;
  showResult?: boolean;
}

export const StadiumMatchesSection = ({ title, matches, emptyMessage, showResult = false }: StadiumMatchesSectionProps) => {
  const formatMatchDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd-MM-yyyy HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50/50">
        <CardTitle className="text-xl text-green-700 flex items-center">
          {title}
          {matches.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({matches.length} match{matches.length !== 1 ? 'es' : ''})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {matches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {matches.map((match, index) => (
              <div 
                key={match.match_id} 
                className={`flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors ${
                  index === 0 ? 'border-t-0' : ''
                }`}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  {/* Date and Time */}
                  <div className="text-sm text-gray-600 font-medium">
                    {formatMatchDate(match.match_date)}
                  </div>

                  {/* Teams */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="font-semibold text-gray-900 text-right flex-1">
                        {match.home_team_name}
                      </span>
                      
                      {match.status === 'completed' ? (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg min-w-[80px] justify-center">
                          <span className="font-bold text-lg">
                            {match.home_score} - {match.away_score}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg min-w-[80px] justify-center">
                          <span className="text-blue-600 font-medium text-sm">vs</span>
                        </div>
                      )}
                      
                      <span className="font-semibold text-gray-900 text-left flex-1">
                        {match.away_team_name}
                      </span>
                    </div>
                    
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {match.competition}
                      </span>
                    </div>
                  </div>

                  {/* View Match Link */}
                  <div className="flex items-center justify-end">
                    <Link 
                      to={`/match/${match.match_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Match
                    </Link>
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
