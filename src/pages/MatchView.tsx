
import { useParams } from "react-router-dom";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import MatchViewHeader from "./MatchView/components/MatchViewHeader";
import MatchInfoCard from "./MatchView/components/MatchInfoCard";
import MatchInformationCards from "./MatchView/components/MatchInformationCards";
import MatchStatisticsCard from "./MatchView/components/MatchStatisticsCard";
import EmptyMatchState from "./MatchView/components/EmptyMatchState";
import MatchViewLoading from "./MatchView/components/MatchViewLoading";
import MatchViewError from "./MatchView/components/MatchViewError";
import { generateMockStats } from "./MatchView/utils/matchStatsGenerator";

const MatchView = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const parsedMatchId = matchId ? parseInt(matchId) : undefined; 
  const { match, highlights, isLoading, error } = useMatchDetails(parsedMatchId);

  const matchStats = generateMockStats(match);
  
  if (isLoading) {
    return <MatchViewLoading />;
  }

  if (error || !match) {
    return <MatchViewError error={error} />;
  }

  const isUpcoming = match.status === 'scheduled';
  const isCompleted = match.status === 'completed';
  
  return (
    <div className="space-y-8">
      <MatchViewHeader 
        homeTeamName={match.home_team_name} 
        awayTeamName={match.away_team_name} 
      />
      
      <MatchInfoCard match={match} matchId={matchId} />

      <MatchInformationCards match={match} />

      {isCompleted && matchStats && (
        <MatchStatisticsCard match={match} matchStats={matchStats} />
      )}

      {isUpcoming && <EmptyMatchState />}
    </div>
  );
};

export default MatchView;
