
import { useState } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SaveLineupParams {
  matchId: number;
  teamId: number;
  formation: string;
  selectedPlayers: { [key: string]: PlayerData };
  substitutes: PlayerData[];
}

export const useLineupSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedLineup, setSavedLineup] = useState<any>(null);

  const validateLineup = (formation: string, selectedPlayers: { [key: string]: PlayerData }) => {
    // Check if all required positions have players assigned
    const formationParts = formation.split('-');
    const defenders = parseInt(formationParts[0]);
    const midfielders = parseInt(formationParts[1]);
    const forwards = parseInt(formationParts[2] || '0');
    
    // Required positions
    const requiredPositions = ['GK'];
    
    // Add defender positions
    for (let i = 1; i <= defenders; i++) {
      requiredPositions.push(`DEF${i}`);
    }
    
    // Add midfielder positions
    for (let i = 1; i <= midfielders; i++) {
      requiredPositions.push(`MID${i}`);
    }
    
    // Add forward positions
    for (let i = 1; i <= forwards; i++) {
      requiredPositions.push(`FWD${i}`);
    }
    
    // Check if all required positions are filled
    const missingPositions = requiredPositions.filter(pos => !selectedPlayers[pos]);
    
    return {
      isValid: missingPositions.length === 0,
      missingPositions
    };
  };

  const saveLineup = async ({ matchId, teamId, formation, selectedPlayers, substitutes }: SaveLineupParams) => {
    try {
      setIsSaving(true);
      
      // Check for any missing positions
      const { isValid, missingPositions } = validateLineup(formation, selectedPlayers);
      
      if (!isValid) {
        toast({
          title: "Incomplete Lineup",
          description: `Please assign players to all positions: ${missingPositions.join(', ')}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Convert selectedPlayers to player_positions format for database
      const playerPositions: Record<string, number> = {};
      
      Object.entries(selectedPlayers).forEach(([position, player]) => {
        if (player) {
          playerPositions[position] = player.player_id;
        }
      });
      
      // Extract substitute player IDs
      const substituteIds = substitutes.map(player => player.player_id);
      
      // Check if lineup already exists for this match and team
      const { data: existingLineup } = await supabase
        .from('match_lineups')
        .select('id')
        .eq('match_id', matchId)
        .eq('team_id', teamId)
        .single();
      
      let result;
      
      if (existingLineup) {
        // Update existing lineup
        result = await supabase
          .from('match_lineups')
          .update({
            formation,
            player_positions: playerPositions,
            substitutes: substituteIds
          })
          .eq('id', existingLineup.id);
      } else {
        // Create new lineup
        result = await supabase
          .from('match_lineups')
          .insert({
            match_id: matchId,
            team_id: teamId,
            formation,
            player_positions: playerPositions,
            substitutes: substituteIds
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "Lineup Saved",
        description: "Your lineup has been saved successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast({
        title: "Error",
        description: "Failed to save lineup. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadLineup = async (matchId: number, teamId: number) => {
    try {
      const { data, error } = await supabase
        .from('match_lineups')
        .select('*')
        .eq('match_id', matchId)
        .eq('team_id', teamId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error code
          console.error("Error loading lineup:", error);
        }
        return null;
      }
      
      setSavedLineup(data);
      return data;
    } catch (error) {
      console.error("Error loading lineup:", error);
      return null;
    }
  };

  return {
    isSaving,
    savedLineup,
    saveLineup,
    loadLineup,
    validateLineup
  };
};
