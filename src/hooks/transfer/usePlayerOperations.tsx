
import { supabase } from "@/integrations/supabase/client";

export const usePlayerOperations = () => {
  const updatePlayerTeam = async (playerId: number, newTeamId: number) => {
    const { error } = await supabase
      .from('players')
      .update({
        team_id: newTeamId,
        owned_since: new Date().toISOString()
      })
      .eq('player_id', playerId);

    if (error) throw error;
  };

  const deactivatePlayerListings = async (playerId: number) => {
    console.log(`Deactivating all listings for player ID: ${playerId}`);
    
    try {
      // First, count the active listings
      const { data: countData, error: countError } = await supabase
        .from('transfer_listings')
        .select('id')
        .eq('player_id', playerId)
        .eq('is_active', true);
      
      if (countError) {
        console.error('Error counting listings:', countError);
        throw countError;
      }
      
      const listingsCount = countData?.length || 0;
      
      // Then, deactivate the listings
      const { error: updateError } = await supabase
        .from('transfer_listings')
        .update({ is_active: false })
        .eq('player_id', playerId)
        .eq('is_active', true);
      
      if (updateError) {
        console.error('Error deactivating listings:', updateError);
        throw updateError;
      }
      
      console.log(`Successfully deactivated ${listingsCount} listings for player ID: ${playerId}`);
      return listingsCount;
    } catch (error) {
      console.error('Exception while deactivating listings:', error);
      throw error;
    }
  };

  return {
    updatePlayerTeam,
    deactivatePlayerListings
  };
};
