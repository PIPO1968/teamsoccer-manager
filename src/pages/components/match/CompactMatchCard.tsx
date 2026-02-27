
import { format, parseISO, isValid } from "date-fns";
import { Eye, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TeamMatch } from "@/hooks/useTeamMatches";

interface CompactMatchCardProps {
  match: TeamMatch;
  hideScores?: boolean;
}

export const CompactMatchCard = ({ match, hideScores = false }: CompactMatchCardProps) => {
  const navigate = useNavigate();

  const formatMatchDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return "Invalid date";
      return format(date, "dd-MM-yyyy HH:mm");
    } catch (error) {
      return "Invalid date";
    }
  };

  const viewMatchDetails = () => {
    navigate(`/match/${match.match_id}`);
  };

  const viewLineup = () => {
    navigate(`/match/${match.match_id}/lineup`);
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case "Win":
        return "text-green-600";
      case "Draw":
        return "text-yellow-600";
      case "Loss":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getCompetitionIcon = (competition: string) => {
    if (competition.toLowerCase().includes('friendly')) {
      return "🤝";
    }
    return "🏆";
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center flex-1">
        {/* Trophy/Competition Icon */}
        <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center mr-4 flex-shrink-0">
          <span className="text-white text-xs font-bold">{getCompetitionIcon(match.competition)}</span>
        </div>
        
        {/* Match Date */}
        <div className="text-sm text-gray-600 w-[120px] mr-6 flex-shrink-0">
          {formatMatchDate(match.match_date)}
        </div>
        
        {/* Teams and Score Container */}
        <div className="flex items-center flex-1 mr-6">
          {/* Home Team */}
          <div className="flex-1 text-right pr-3">
            <span className={`font-medium text-sm ${match.is_home ? "text-blue-600" : ""}`}>
              {match.home_team_name}
            </span>
          </div>
          
          {/* Score Display */}
          <div className="flex-shrink-0">
            {match.status === 'completed' && !hideScores ? (
              <div className="px-3 py-1 bg-gray-100 rounded text-sm font-bold w-20 text-center">
                {match.home_score} - {match.away_score}
              </div>
            ) : match.status === 'completed' && hideScores ? (
              <div className="px-3 py-1 bg-gray-200 rounded text-sm text-gray-500 w-20 text-center">
                - - -
              </div>
            ) : (
              <div className="px-3 py-1 bg-blue-50 rounded text-sm text-blue-600 w-20 text-center">
                vs
              </div>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex-1 text-left pl-3">
            <span className={`font-medium text-sm ${!match.is_home ? "text-blue-600" : ""}`}>
              {match.away_team_name}
            </span>
          </div>
        </div>
        
        {/* Competition */}
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mr-6 w-[100px] text-center flex-shrink-0">
          {match.competition}
        </div>
        
        {/* Result */}
        <div className="w-[50px] text-center flex-shrink-0 mr-6">
          {match.status === 'completed' && match.result && !hideScores ? (
            <div className={`text-sm font-medium ${getResultColor(match.result)}`}>
              {match.result}
            </div>
          ) : match.status === 'completed' && hideScores ? (
            <div className="text-sm font-medium text-gray-400">
              ---
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
        {match.status === 'completed' ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewMatchDetails}
            className="h-8 w-8 p-0"
          >
            <FileText className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={viewLineup}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={viewMatchDetails}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
