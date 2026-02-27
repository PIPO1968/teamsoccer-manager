
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to handle authorization logic for transfer market pages
 * Ensures only team owners or admins can view specific team data
 */
export const useTransferMarketAuth = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { team } = useUserTeam();
  const { manager } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (team) {
      const userTeamId = team?.team_id?.toString();
      
      if (teamId !== userTeamId && manager?.is_admin !== 1) {
        toast({
          title: "Access Denied",
          description: "You can only view your own team's transfer data",
          variant: "destructive"
        });
        navigate("/transfer-market");
      }
    }
  }, [team, teamId, manager, navigate, toast]);

  return {
    isAuthorized: team && (team?.team_id?.toString() === teamId || manager?.is_admin === 1),
    userTeam: team,
  };
};
