
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
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
      const data = await apiFetch<{ success: boolean; entries: GuestbookEntry[] }>(
        `/teams/${parseInt(teamId)}/guestbook?limit=3`
      );
      setLatestEntries(data.entries || []);
      if (manager?.user_id) {
        const posted = (data.entries || []).some(e => e.author_id === manager.user_id);
        if (posted) setHasPosted(true);
      }
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
      const data = await apiFetch<{ success: boolean; entries: GuestbookEntry[] }>(
        `/teams/${parseInt(teamId)}/guestbook`
      );
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error in useTeamGuestbook:", error);
    } finally {
      setIsLoading(false);
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

    if (hasPosted) {
      toast({
        title: "Not allowed",
        description: "You have already posted a message in this guestbook",
        variant: "destructive",
      });
      return false;
    }

    try {
      await apiFetch(`/teams/${parseInt(teamId)}/guestbook`, {
        method: 'POST',
        body: JSON.stringify({ authorId: manager.user_id, message }),
      });

      toast({ title: "Success", description: "Guestbook entry added" });
      setHasPosted(true);
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
