
import { format, parseISO, isValid } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";
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

  // Formatea la fecha y hora en la zona horaria local del país local
  const formatLocalDateTime = (dateString: string, timezone: string) => {
    try {
      // Log temporal para depuración
      // eslint-disable-next-line no-console
      console.log('match_date y timezone en CompactMatchCard:', dateString, timezone);
      if (!dateString) return { date: "Sin fecha", time: "" };
      const utcDate = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      if (!isValid(utcDate)) return { date: "Invalid date", time: "" };
      try {
        const zoned = toZonedTime(utcDate, timezone);
        return {
          date: formatTz(zoned, "dd/MM/yyyy", { timeZone: timezone }),
          time: formatTz(zoned, "HH:mm", { timeZone: timezone })
        };
      } catch {
        // Fallback: mostrar UTC si falla la zona horaria
        return {
          date: format(utcDate, "dd/MM/yyyy"),
          time: format(utcDate, "HH:mm")
        };
      }
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
        <div className="text-sm text-gray-600 w-[160px] mr-6 flex-shrink-0">
          {(() => {
            const { date, time } = formatLocalDateTime(match.match_date, match.home_timezone);
            const diffLabel = getTimeDiffLabel(match.home_timezone);
            return <>{date} {time} <span className="text-gray-400">{diffLabel}</span></>;
          })()}
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
