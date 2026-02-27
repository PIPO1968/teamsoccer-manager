
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type GuestbookEntry = {
  id: number;
  author_id: number;
  author_name: string;
  message: string;
  created_at: string;
};

export const useTeamGuestbook = (teamId: string | undefined) => {
  const [latestEntries, setLatestEntries] = useState<GuestbookEntry[]>([]);
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const { manager } = useAuth();

  const fetchLatestEntries = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_guestbook')
        .select(`
          id,
          author_id,
          message,
          created_at,
          managers!team_guestbook_author_id_fkey(username)
        `)
        .eq('team_id', parseInt(teamId))
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) {
        console.error("Error fetching latest guestbook entries:", error);
        return;
      }
      
      const formattedEntries = data?.map(entry => ({
        id: entry.id,
        author_id: entry.author_id,
        author_name: (entry.managers as any)?.username || 'Unknown',
        message: entry.message,
        created_at: entry.created_at
      })) || [];
      
      setLatestEntries(formattedEntries);
    } catch (error) {
      console.error("Error in useTeamGuestbook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllEntries = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_team_guestbook_entries', { p_team_id: parseInt(teamId) });
        
      if (error) {
        console.error("Error fetching guestbook entries:", error);
        return;
      }
      
      setEntries(data || []);
    } catch (error) {
      console.error("Error in useTeamGuestbook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserHasPosted = async () => {
    if (!teamId || !manager?.user_id) return;
    
    try {
      const { data, error } = await supabase
        .from('team_guestbook')
        .select('id')
        .eq('team_id', parseInt(teamId))
        .eq('author_id', manager.user_id)
        .limit(1);
        
      if (error) {
        console.error("Error checking if user has posted:", error);
        return;
      }
      
      setHasPosted(data && data.length > 0);
    } catch (error) {
      console.error("Error checking if user has posted:", error);
    }
  };

  const addEntry = async (message: string) => {
    if (!teamId || !manager?.user_id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a guestbook entry",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if user has already posted
    if (hasPosted) {
      toast({
        title: "Not allowed",
        description: "You have already posted a message in this guestbook",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('team_guestbook')
        .insert({
          team_id: parseInt(teamId),
          author_id: manager.user_id,
          message
        });
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to add guestbook entry: " + error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Guestbook entry added",
      });
      
      // Update local state
      setHasPosted(true);
      
      // Refresh the latest entries
      fetchLatestEntries();
      return true;
    } catch (error) {
      console.error("Error adding guestbook entry:", error);
      toast({
        title: "Error",
        description: "Failed to add guestbook entry",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLatestEntries();
    if (manager?.user_id) {
      checkUserHasPosted();
    }
  }, [teamId, manager?.user_id]);

  return {
    latestEntries,
    entries,
    isLoading,
    hasPosted,
    addEntry,
    fetchAllEntries,
    fetchLatestEntries
  };
};
