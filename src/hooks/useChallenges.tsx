
import { useState, useCallback } from "react";
import { apiFetch } from "@/services/apiClient";
import { toast } from "sonner";

export interface Challenge {
  id: number;
  challenger_team_id: number;
  challenger_team_name: string;
  challenger_team_logo: string | null;
  challenged_team_id: number;
  challenged_team_name: string;
  challenged_team_logo: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  scheduled_date: string | null;
  is_sender: boolean;
}

export const useChallenges = (teamId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);

  const numericTeamId = teamId ? Number(teamId) : null;

  const fetchChallenges = useCallback(async () => {
    if (!numericTeamId) return [];
    try {
      const data = await apiFetch<{ success: boolean; challenges: Challenge[] }>(
        `/teams/${numericTeamId}/challenges`
      );
      return data.challenges || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }, [numericTeamId]);

  const respondToChallenge = useCallback(async (challengeId: number, accept: boolean) => {
    if (!numericTeamId) return false;
    try {
      setIsLoading(true);
      await apiFetch(`/challenges/${challengeId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ teamId: numericTeamId, accept }),
      });
      toast.success(`Challenge ${accept ? 'accepted' : 'rejected'} successfully`);
      return true;
    } catch (error) {
      console.error('Error responding to challenge:', error);
      toast.error(`Failed to ${accept ? 'accept' : 'reject'} challenge`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [numericTeamId]);

  const sendChallenge = useCallback(async (challengedTeamId: number) => {
    if (!numericTeamId) {
      toast.error("Cannot send challenge: No team ID available");
      return false;
    }
    if (numericTeamId === Number(challengedTeamId)) {
      toast.error("You cannot challenge your own team");
      return false;
    }
    try {
      setIsLoading(true);
      await apiFetch(`/teams/${numericTeamId}/challenges`, {
        method: 'POST',
        body: JSON.stringify({ challengedTeamId }),
      });
      toast.success('Challenge sent successfully');
      return true;
    } catch (error: any) {
      console.error('Error sending challenge:', error);
      toast.error(error?.message || 'Failed to send challenge');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [numericTeamId]);

  return {
    isLoading,
    fetchChallenges,
    respondToChallenge,
    sendChallenge
  };
};
