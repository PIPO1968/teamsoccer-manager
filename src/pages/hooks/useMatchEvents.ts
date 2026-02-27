import { useState, useEffect, useRef } from 'react';
import { MatchEventData } from '../components/types/matchTypes';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UseMatchEventsProps {
  match: any;
  simulation: {
    homeScore: number;
    awayScore: number;
  };
  setPlayerPerformances: (fn: (prev: {[key: string]: number}) => {[key: string]: number}) => void;
  setMatchRating: (rating: number) => void;
  shots: { home: number; away: number };
  yellowCards: { home: number; away: number };
}

export const useMatchEvents = ({
  match,
  simulation,
  setPlayerPerformances,
  setMatchRating,
  shots,
  yellowCards
}: UseMatchEventsProps) => {
  const [matchEvents, setMatchEvents] = useState<MatchEventData[]>([]);
  const simulationRef = useRef(simulation);

  useEffect(() => {
    simulationRef.current = simulation;
  }, [simulation]);

  useEffect(() => {
    const fetchMatchEvents = async () => {
      if (match?.match_id) {
        const { data, error } = await supabase.rpc('get_match_highlights', {
          p_match_id: match.match_id
        });

        if (error) {
          console.error('Error fetching match events:', error);
          return;
        }

        if (data) {
          const events = data.map((event: any) => ({
            minute: event.minute,
            type: event.event_type,
            description: event.description,
            team: event.team,
            player: event.player_name,
            homeScore: event.team === 'home' ? simulation.homeScore : undefined,
            awayScore: event.team === 'away' ? simulation.awayScore : undefined
          }));
          setMatchEvents(events);
        }
      }
    };

    fetchMatchEvents();
  }, [match?.match_id]);

  const handleMatchEvent = (event: MatchEventData) => {
    setMatchEvents(prev => [...prev, event]);
    
    if (event.minute === 45) {
      toast({
        title: "Half Time",
        description: `${match?.home_team_name || 'Home'} ${simulationRef.current.homeScore} - ${simulationRef.current.awayScore} ${match?.away_team_name || 'Away'}`,
      });
    } else if (event.minute >= 90) {
      toast({
        title: "Full Time",
        description: `${match?.home_team_name || 'Home'} ${simulationRef.current.homeScore} - ${simulationRef.current.awayScore} ${match?.away_team_name || 'Away'}`,
      });
      
      const totalGoals = simulationRef.current.homeScore + simulationRef.current.awayScore;
      const totalShots = shots.home + shots.away;
      const excitementFactor = totalGoals * 0.5 + totalShots * 0.1 - yellowCards.home - yellowCards.away;
      setMatchRating(Math.min(Math.max(5 + excitementFactor, 3), 10));
    }
    
    if (event.type === "goal" && event.player) {
      setPlayerPerformances(prev => {
        const updated = { ...prev };
        updated[event.player!] = (updated[event.player!] || 0) + 1;
        return updated;
      });
    }
  };

  return {
    matchEvents,
    setMatchEvents,
    handleMatchEvent
  };
};
