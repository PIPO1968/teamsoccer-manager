
import { Button } from "@/components/ui/button";
import { useChallenges } from "@/hooks/useChallenges";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

interface ChallengeButtonProps {
  teamId: string | number;
  challengedTeamId: number;
  challengedTeamName: string;
  isBot?: number;
}

export const ChallengeButton = ({ teamId, challengedTeamId, challengedTeamName, isBot = 0 }: ChallengeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendChallenge } = useChallenges(teamId?.toString());
  const { team: currentTeam, isLoading: teamLoading } = useUserTeam();
  const { teamId: routeTeamId } = useParams<{ teamId: string }>();
  
  // Additional logging to understand what's happening
  console.log('ChallengeButton component mounted with props:', {
    providedTeamId: teamId,
    challengedTeamId,
    challengedTeamName,
    isBot,
    currentTeam: currentTeam?.team_id,
    routeTeamId
  });
  
  const handleChallenge = async () => {
    // Convert IDs to numbers for consistent comparison
    const currentTeamId = Number(currentTeam?.team_id);
    const targetTeamId = Number(challengedTeamId);
    
    console.info('Challenge button clicked:', {
      'Current team ID': currentTeamId,
      'Challenge team ID': targetTeamId,
      'Challenge team name': challengedTeamName,
      'Are IDs equal?': currentTeamId === targetTeamId,
      'currentTeamId type': typeof currentTeamId,
      'targetTeamId type': typeof targetTeamId
    });
    
    // Safety check to prevent self-challenge
    if (currentTeamId === targetTeamId) {
      console.error(`Self-challenge prevented in UI: ${currentTeamId} tried to challenge itself`);
      toast.error("You cannot challenge your own team");
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await sendChallenge(targetTeamId);
      if (success) {
        // Stay on the current page, don't redirect
        toast.success(`Challenge sent to ${challengedTeamName}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced debug logging for visibility conditions
  const shouldShowButton = teamId && isBot !== 1 && parseInt(teamId.toString()) !== challengedTeamId;
  
  console.log('ChallengeButton render decision:', {
    'teamId': teamId,
    'challengedTeamId': challengedTeamId,
    'isBot': isBot,
    'Button will show': shouldShowButton,
    'Are IDs equal?': parseInt(teamId?.toString() || '0') === challengedTeamId,
    'currentTeam': currentTeam
  });

  // Don't show the button if:
  // 1. The team is a bot
  // 2. There's no team ID (shouldn't happen but TypeScript wants us to check)
  // 3. The challenged team is the same as the challenging team
  // 4. currentTeam is still loading
  if (!shouldShowButton || teamLoading) {
    return null;
  }

  return (
    <Button 
      onClick={handleChallenge} 
      variant="outline" 
      size="sm"
      disabled={isLoading}
    >
      {isLoading ? "Sending..." : "Challenge to Friendly Match"}
    </Button>
  );
};
