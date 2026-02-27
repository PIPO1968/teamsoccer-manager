
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, nextWednesday, startOfDay } from "date-fns";

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
  
  console.log('useChallenges hook initialized with teamId:', {
    'Original teamId': teamId,
    'Numeric teamId': numericTeamId,
    'Type of original': typeof teamId,
    'Type of numeric': typeof numericTeamId,
  });

  const fetchChallenges = useCallback(async () => {
    if (!numericTeamId) {
      console.warn('fetchChallenges: No valid teamId provided', { teamId, numericTeamId });
      return [];
    }
    
    try {
      console.log(`Fetching challenges for team ID: ${numericTeamId}`);
      
      const { data, error } = await supabase
        .from('team_challenges')
        .select(`
          id,
          challenger_team_id,
          challenger:teams!team_challenges_challenger_team_id_fkey (
            name,
            club_logo
          ),
          challenged_team_id,
          challenged:teams!team_challenges_challenged_team_id_fkey (
            name,
            club_logo
          ),
          status,
          created_at,
          scheduled_date
        `)
        .or(`challenger_team_id.eq.${numericTeamId},challenged_team_id.eq.${numericTeamId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error in fetchChallenges:', error);
        throw error;
      }
      
      const formattedData = data.map(item => ({
        id: item.id,
        challenger_team_id: item.challenger_team_id,
        challenger_team_name: item.challenger.name,
        challenger_team_logo: item.challenger.club_logo,
        challenged_team_id: item.challenged_team_id,
        challenged_team_name: item.challenged.name,
        challenged_team_logo: item.challenged.club_logo,
        status: item.status as 'pending' | 'accepted' | 'rejected',
        created_at: item.created_at,
        scheduled_date: item.scheduled_date,
        is_sender: item.challenger_team_id === numericTeamId
      }));
      
      console.log(`Successfully fetched ${formattedData.length} challenges for team ${numericTeamId}`);
      return formattedData;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }, [numericTeamId]);

  const respondToChallenge = useCallback(async (challengeId: number, accept: boolean) => {
    if (!numericTeamId) {
      console.error("Cannot respond to challenge: No valid team ID");
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log(`Team ${numericTeamId} responding to challenge ${challengeId}: ${accept ? 'accept' : 'reject'}`);
      
      // Get challenge details before updating status
      const { data: challengeData, error: fetchError } = await supabase
        .from('team_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('challenged_team_id', numericTeamId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching challenge details:', fetchError);
        throw fetchError;
      }
      
      if (!challengeData) {
        console.error('Challenge not found or user not authorized to respond');
        toast.error("Challenge not found or you're not authorized to respond");
        return false;
      }

      // Update challenge status
      const { error } = await supabase
        .from('team_challenges')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', challengeId)
        .eq('challenged_team_id', numericTeamId);

      if (error) {
        console.error('Database error when responding to challenge:', error);
        throw error;
      }
      
      // If challenge was accepted, create a match
      if (accept && challengeData.scheduled_date) {
        console.log('Creating match for accepted challenge:', {
          challenger_team_id: challengeData.challenger_team_id,
          challenged_team_id: challengeData.challenged_team_id,
          scheduled_date: challengeData.scheduled_date
        });
        
        // Create a friendly match between the teams
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .insert({
            home_team_id: challengeData.challenged_team_id, // Challenged team is home team
            away_team_id: challengeData.challenger_team_id, // Challenger team is away team
            match_date: challengeData.scheduled_date,
            status: 'scheduled',
            is_friendly: true
          })
          .select()
          .single();
          
        if (matchError) {
          console.error('Error creating match for accepted challenge:', matchError);
          toast.error('Challenge accepted but match could not be created');
          return true; // Still return true as the challenge was accepted
        }
        
        console.log('Match created successfully:', matchData);
        
        // Send notification message to the challenger
        const { data: challengerTeam } = await supabase
          .from('teams')
          .select('name, manager_id')
          .eq('team_id', challengeData.challenger_team_id)
          .single();
          
        const { data: challengedTeam } = await supabase
          .from('teams')
          .select('name, manager_id')
          .eq('team_id', challengeData.challenged_team_id)
          .single();
          
        if (challengerTeam && challengedTeam) {
          const matchDate = new Date(challengeData.scheduled_date);
          
          await supabase
            .from('messages')
            .insert({
              sender_id: challengedTeam.manager_id,
              recipient_id: challengerTeam.manager_id,
              subject: 'Challenge Accepted',
              content: `${challengedTeam.name} has accepted your challenge! A friendly match has been scheduled for ${matchDate.toLocaleDateString()} at ${matchDate.toLocaleTimeString()}. You can view this match in your match schedule.`
            });
        }
      }
      
      console.log(`Successfully ${accept ? 'accepted' : 'rejected'} challenge ${challengeId}`);
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
      console.error("Cannot send challenge: No valid team ID provided", { teamId });
      toast.error("Cannot send challenge: No team ID available");
      return false;
    }
    
    const currentTeamId = numericTeamId;
    const targetTeamId = Number(challengedTeamId);
    
    console.info('Challenge attempt details:', {
      'Current team ID (sender)': currentTeamId,
      'Target team ID (receiver)': targetTeamId,
      'Are IDs equal?': currentTeamId === targetTeamId,
      'Team ID type': typeof currentTeamId,
      'Target ID type': typeof targetTeamId
    });
    
    try {
      setIsLoading(true);
      
      if (currentTeamId === targetTeamId) {
        console.error(`Self-challenge prevented: ${currentTeamId} trying to challenge ${targetTeamId}`);
        toast.error("You cannot challenge your own team");
        return false;
      }
      
      const { data: existingChallenges, error: checkError } = await supabase
        .from('team_challenges')
        .select('*')
        .or(`and(challenger_team_id.eq.${currentTeamId},challenged_team_id.eq.${targetTeamId}),and(challenger_team_id.eq.${targetTeamId},challenged_team_id.eq.${currentTeamId})`)
        .eq('status', 'pending');
      
      if (checkError) {
        console.error('Error checking for existing challenges:', checkError);
        throw checkError;
      }
      
      if (existingChallenges && existingChallenges.length > 0) {
        console.warn('Duplicate challenge prevented:', existingChallenges[0]);
        toast.error('A challenge between these teams already exists');
        return false;
      }
      
      const today = new Date();
      const nextWed = nextWednesday(today);
      
      nextWed.setHours(19, 0, 0, 0);
      
      console.log('Setting scheduled date for challenge to next Wednesday:', nextWed);
      
      const { data: challengerTeam, error: teamError } = await supabase
        .from('teams')
        .select('name, manager_id')
        .eq('team_id', currentTeamId)
        .single();

      if (teamError) {
        console.error('Error fetching challenger team info:', teamError);
        throw teamError;
      }

      const { data: challengedTeam, error: challengedTeamError } = await supabase
        .from('teams')
        .select('manager_id')
        .eq('team_id', targetTeamId)
        .single();

      if (challengedTeamError) {
        console.error('Error fetching challenged team info:', challengedTeamError);
        throw challengedTeamError;
      }

      const { error: challengeError } = await supabase
        .from('team_challenges')
        .insert({
          challenger_team_id: currentTeamId,
          challenged_team_id: targetTeamId,
          status: 'pending',
          scheduled_date: nextWed.toISOString()
        });

      if (challengeError) {
        console.error('Database error when sending challenge:', challengeError);
        throw challengeError;
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: challengerTeam.manager_id,
          recipient_id: challengedTeam.manager_id,
          subject: 'New Team Challenge',
          content: `${challengerTeam.name} has challenged your team to a friendly match scheduled for ${nextWed.toLocaleDateString()} at ${nextWed.toLocaleTimeString()}. You can respond to this challenge in the Challenges section.`
        });

      if (messageError) {
        console.error('Error sending challenge message:', messageError);
        toast.error('Challenge created but notification could not be sent');
        return true;
      }
      
      console.log('Challenge sent successfully:', {
        from: currentTeamId,
        to: targetTeamId,
        scheduledDate: nextWed
      });
      
      toast.success('Challenge sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending challenge:', error);
      toast.error('Failed to send challenge');
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
