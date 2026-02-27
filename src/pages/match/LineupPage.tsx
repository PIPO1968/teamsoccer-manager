import { useParams } from "react-router-dom";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { useUserTeam } from "@/hooks/useUserTeam";
import LineupHeader from "./components/LineupHeader";
import LineupPitch from "./components/LineupPitch";
import FormationSettings from "./components/FormationSettings";
import SubstitutesView from "./components/SubstitutesView";
import PlayersSideBar from "./components/PlayersSideBar";
import LineupLoading from "./components/LineupLoading";
import LineupError from "./components/LineupError";
import { useLineupManagement } from "./hooks/useLineupManagement";
import { Card, CardContent } from "@/components/ui/card";

const LineupPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, isLoading: isMatchLoading } = useMatchDetails(matchId ? parseInt(matchId) : undefined);
  const { team } = useUserTeam();
  
  const teamId = team?.team_id;
  const { players, isLoading: isPlayersLoading } = useTeamPlayers(teamId?.toString());
  
  const {
    selectedFormation,
    setSelectedFormation,
    selectedPlayers,
    substitutes,
    selectedPlayer,
    isComplete,
    isSaving,
    handlePlayerSelect,
    handlePlayerSwap,
    handleSubstituteSwap,
    handleSaveLineup
  } = useLineupManagement({ 
    players, 
    matchId: matchId ? parseInt(matchId) : undefined,
    teamId
  });

  if (isMatchLoading || isPlayersLoading) {
    return <LineupLoading />;
  }

  if (!match || !team) {
    return <LineupError />;
  }

  return (
    <div className="space-y-4">
      <LineupHeader 
        matchId={matchId}
        matchDetails={match}
        onSaveLineup={handleSaveLineup}
        isComplete={isComplete}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-4 space-y-4">
          {/* Main Pitch View */}
          <Card className="bg-green-700 text-white border-0">
            <CardContent className="p-4">
              <FormationSettings
                selectedFormation={selectedFormation}
                onFormationChange={setSelectedFormation}
              />
              
              <LineupPitch
                formation={selectedFormation}
                players={players}
                selectedPlayers={selectedPlayers}
                onPlayerSwap={handlePlayerSwap}
                selectedPlayer={selectedPlayer}
              />
              
              <div className="mt-4 text-center text-white">
                <p className="opacity-80">
                  <span className="font-bold">{selectedFormation}</span>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Substitutes Section */}
          <SubstitutesView 
            substitutes={substitutes} 
            onSubstituteSelect={handleSubstituteSwap}
            selectedPlayer={selectedPlayer}
          />
        </div>
        
        <div className="lg:col-span-2">
          <PlayersSideBar
            players={players}
            selectedPlayers={selectedPlayers}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayer={selectedPlayer}
          />
        </div>
      </div>
    </div>
  );
};

export default LineupPage;
