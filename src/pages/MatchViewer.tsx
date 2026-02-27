
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import MatchCommentary from "./components/match/MatchCommentary";
import MatchHeader from "./components/match/MatchHeader";
import MatchControls from "./components/match/MatchControls";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import { MatchContext } from "./components/match/MatchContext";
import { useInitialPlayers } from "./hooks/useInitialPlayers";
import PlayerDetailsDialogWrapper from "./components/match/PlayerDetailsDialogWrapper";
import MatchSimulationWrapper from "./components/match/MatchSimulationWrapper";
import { MatchStatsProvider } from "./components/match/MatchStatsProvider";
import MatchViewerLayout from "./components/match/MatchViewerLayout";
import StaticMatchField from "./components/match/StaticMatchField";
import MatchChat from "./components/match/MatchChat";
import PlayerInfoPanel from "./components/match/PlayerInfoPanel";
import MatchInfoPanel from "./components/match/MatchInfoPanel";
import { Player } from "./components/types/match";
import MatchHighlightsBlock from "./components/match/MatchHighlightsBlock";

const MatchViewer = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const parsedMatchId = matchId ? parseInt(matchId) : undefined;
  const { match, isLoading: isMatchLoading } = useMatchDetails(parsedMatchId);
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isPlayerDetailsOpen, setIsPlayerDetailsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  const [playerPerformances, setPlayerPerformances] = useState<{[key: string]: number}>({});
  const [matchRating, setMatchRating] = useState(5);
  
  const { homePlayers, awayPlayers, isLoading: isPlayersLoading } = useInitialPlayers({
    matchId: parsedMatchId,
    homeTeamId: match?.home_team_id,
    awayTeamId: match?.away_team_id
  });
  
  const handlePlayerClick = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setIsPlayerDetailsOpen(true);
  };

  const handlePlayerClickFromField = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleClosePlayerInfo = () => {
    setSelectedPlayer(null);
  };
  
  const isLoading = isMatchLoading || isPlayersLoading;
  
  if (isLoading) {
    return (
      <MatchViewerLayout>
        <div className="p-4"><h2>Loading match data...</h2></div>
      </MatchViewerLayout>
    );
  }
  
  if (!match) {
    return (
      <MatchViewerLayout>
        <div className="p-4">
          <h2>Match data not found</h2>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link to="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Matches
            </Link>
          </Button>
        </div>
      </MatchViewerLayout>
    );
  }

  // Handle speed changes with new multipliers: 1x, 4x, 8x, 16x
  const handleSpeedUp = (currentSpeed: number, setSpeed: (speed: number) => void) => {
    const speedValues = [1, 4, 8, 16];
    const currentIndex = speedValues.indexOf(currentSpeed);
    if (currentIndex < speedValues.length - 1) {
      setSpeed(speedValues[currentIndex + 1]);
    }
  };

  const handleSpeedDown = (currentSpeed: number, setSpeed: (speed: number) => void) => {
    const speedValues = [1, 4, 8, 16];
    const currentIndex = speedValues.indexOf(currentSpeed);
    if (currentIndex > 0) {
      setSpeed(speedValues[currentIndex - 1]);
    }
  };

  return (
    <MatchViewerLayout>
      <MatchStatsProvider>
        <div className="px-4 py-2 max-w-full">
          <div className="mb-4">
            <Button asChild variant="outline" size="sm" className="mb-4">
              <Link to={`/match/${match.match_id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Match Details
              </Link>
            </Button>
          </div>
          
          <MatchSimulationWrapper
            homePlayers={homePlayers}
            awayPlayers={awayPlayers}
            homeTeamId={match.home_team_id}
            awayTeamId={match.away_team_id}
          >
            {(simulation) => {
              // Calculate final scores
              const finalHomeScore = simulation.isFullTime ? simulation.homeScore : (match.home_score || simulation.homeScore);
              const finalAwayScore = simulation.isFullTime ? simulation.awayScore : (match.away_score || simulation.awayScore);
              
              const matchContextValue = {
                matchTime: simulation.matchTime,
                homeScore: finalHomeScore,
                awayScore: finalAwayScore,
                isPlaying: simulation.isPlaying,
                isHalfTime: simulation.isHalfTime,
                isFullTime: simulation.isFullTime,
                matchSpeed: simulation.matchSpeed,
                playerPositions: simulation.playerPositions,
                matchEvents: simulation.matchEvents,
                playerPerformances,
                matchRating,
                weather: simulation.weather,
                setMatchSpeed: (speed) => simulation.setIsPlaying(simulation.isPlaying, speed),
                handlePlayPause: () => {
                  simulation.setIsPlaying(!simulation.isPlaying);
                },
                handleSkip: () => simulation.skipAhead(45),
                handleRestart: () => simulation.restartMatch()
              };
              
              return (
                <MatchContext.Provider value={matchContextValue}>
                  <div className="space-y-6 max-w-full">
                    {/* Match Header with Final Scores */}
                    <MatchHeader 
                      match={match} 
                      homeScore={finalHomeScore} 
                      awayScore={finalAwayScore} 
                      matchTime={simulation.matchTime}
                      isCompleted={simulation.isFullTime}
                      isUpcoming={simulation.matchTime === 0 && !simulation.isPlaying}
                      weather={simulation.weather}
                    />
                    
                    {/* Match Controls - Now directly below the header */}
                    <Card className="w-full">
                      <div className="p-4">
                        <MatchControls
                          isPlaying={simulation.isPlaying}
                          matchTime={simulation.matchTime}
                          matchSpeed={simulation.matchSpeed}
                          isHalfTime={simulation.isHalfTime}
                          isFullTime={simulation.isFullTime}
                          onPlayPause={() => {
                            simulation.setIsPlaying(!simulation.isPlaying);
                          }}
                          onSpeedUp={() => handleSpeedUp(simulation.matchSpeed, (speed) => simulation.setIsPlaying(simulation.isPlaying, speed))}
                          onSpeedDown={() => handleSpeedDown(simulation.matchSpeed, (speed) => simulation.setIsPlaying(simulation.isPlaying, speed))}
                          onSkip={() => simulation.skipAhead(45)}
                          onRestart={simulation.restartMatch}
                        />
                      </div>
                    </Card>
                    
                    {/* Main Content with Soccer Field and Info Panels - Full width */}
                    <div className="flex gap-6 w-full">
                      {/* Soccer Field - Takes remaining space */}
                      <div className="flex-1 min-w-0">
                        <StaticMatchField
                          homePlayers={homePlayers}
                          awayPlayers={awayPlayers}
                          homeTeamName={match.home_team_name}
                          awayTeamName={match.away_team_name}
                          onPlayerClick={handlePlayerClickFromField}
                        />
                      </div>
                      
                      {/* Info Panels - Fixed width on the right */}
                      <div className="w-80 flex-shrink-0 space-y-4">
                        {selectedPlayer ? (
                          <PlayerInfoPanel
                            player={selectedPlayer}
                            onClose={handleClosePlayerInfo}
                          />
                        ) : (
                          <MatchInfoPanel
                            homeTeamName={match.home_team_name}
                            awayTeamName={match.away_team_name}
                            homeScore={finalHomeScore}
                            awayScore={finalAwayScore}
                            matchTime={simulation.matchTime}
                            stadium={match.stadium_name || `${match.home_team_name} Stadium`}
                            weather={simulation.weather}
                            stadiumId={match.stadium_id}
                            stadiumCapacity={15000}
                          />
                        )}
                        
                        {/* Highlights Block - Always shown below */}
                        <MatchHighlightsBlock matchId={Number(match.match_id)} />
                      </div>
                    </div>

                    {/* Live Commentary - Reduced Height */}
                    <div className="mt-6 w-full">
                      <Card className="h-[300px] flex flex-col shadow-lg border-l-4 border-l-primary">
                        <MatchCommentary 
                          matchEvents={simulation.matchEvents} 
                          isFullTime={simulation.isFullTime}
                          matchId={Number(match.match_id)}
                          onPlayerClick={handlePlayerClick}
                        />
                      </Card>
                    </div>

                    {/* Match Chat - Reduced Height */}
                    <div className="mt-6 w-full">
                      <MatchChat matchId={Number(match.match_id)} />
                    </div>
                  </div>
                </MatchContext.Provider>
              );
            }}
          </MatchSimulationWrapper>

          <PlayerDetailsDialogWrapper
            selectedPlayerId={selectedPlayerId}
            isPlayerDetailsOpen={isPlayerDetailsOpen}
            setIsPlayerDetailsOpen={setIsPlayerDetailsOpen}
            setSelectedPlayerId={setSelectedPlayerId}
          />
        </div>
      </MatchStatsProvider>
    </MatchViewerLayout>
  );
};

export default MatchViewer;
