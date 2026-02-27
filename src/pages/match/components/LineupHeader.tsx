
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Save } from "lucide-react";

interface LineupHeaderProps {
  matchId: string | undefined;
  matchDetails: {
    home_team_name: string;
    away_team_name: string;
  } | null;
  onSaveLineup: () => void;
  isComplete: boolean;
  isSaving: boolean;
}

const LineupHeader: React.FC<LineupHeaderProps> = ({
  matchId,
  matchDetails,
  onSaveLineup,
  isComplete,
  isSaving
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" onClick={() => navigate(`/match/${matchId}`)}>
          <div>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Match
          </div>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/match/${matchId}`)}>
            <Info className="h-4 w-4 mr-2" />
            Match Info
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSaveLineup}
            disabled={!isComplete || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Lineup"}
          </Button>
        </div>
      </div>
      
      <div className="bg-green-800 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Lineup: {matchDetails?.home_team_name} vs {matchDetails?.away_team_name}
          </h1>
          {!isComplete && (
            <div className="text-yellow-300 text-sm font-medium">
              Complete your lineup to save
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LineupHeader;
