import { useState, useRef, useCallback, useEffect } from 'react';
import { MatchEventData } from '../../components/types/matchTypes';

interface UseMatchTimeProps {
  matchSpeed: number;
  onMatchEvent?: (event: MatchEventData) => void;
  matchTimeline: MatchEventData[];
}

export const useMatchTime = ({ matchSpeed, onMatchEvent, matchTimeline }: UseMatchTimeProps) => {
  const [matchTime, setMatchTime] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [scores, setScores] = useState({ homeScore: 0, awayScore: 0 });
  const matchTimelineRef = useRef<MatchEventData[]>(matchTimeline);

  // Keep the timeline reference updated
  useEffect(() => {
    matchTimelineRef.current = matchTimeline;
  }, [matchTimeline]);

  const updateMatchTime = useCallback((isPlaying: boolean) => {
    if (!isPlaying) return;

    setMatchTime(prevTime => {
      // Increment by 1 second per real second, multiplied by speed
      // 1/60 represents 1 second in a 90-minute match, then multiply by speed
      const increment = (1/60) * matchSpeed;
      const newTime = Math.min(prevTime + increment, 90);

      // Use the current reference to the timeline
      const timeline = matchTimelineRef.current;
      
      if (timeline && timeline.length > 0) {
        const nextEvents = timeline.filter(
          event => event.minute > prevTime && event.minute <= newTime
        );

        if (nextEvents.length > 0) {
          let latestScore = { ...scores };
          
          // Process all events that occurred in this time step
          nextEvents.forEach(event => {
            if (onMatchEvent) {
              console.log("Triggering match event at time:", newTime, "Event:", event);
              onMatchEvent(event);
            }
            
            if ('homeScore' in event && 'awayScore' in event) {
              latestScore = {
                homeScore: event.homeScore ?? latestScore.homeScore,
                awayScore: event.awayScore ?? latestScore.awayScore
              };
            }
          });
          
          setCurrentEventIndex(
            timeline.indexOf(nextEvents[nextEvents.length - 1])
          );
          
          setScores(latestScore);
        }
      }

      return newTime;
    });
  }, [onMatchEvent, scores, matchSpeed]);

  const skipAhead = useCallback((minutes: number) => {
    setMatchTime(prevTime => {
      const newTime = Math.min(prevTime + minutes, 90);
      const timeline = matchTimelineRef.current;
      
      if (timeline && timeline.length > 0) {
        const skippedEvents = timeline.filter(
          event => event.minute > prevTime && event.minute <= newTime
        );
        
        if (skippedEvents.length > 0) {
          const lastEvent = skippedEvents[skippedEvents.length - 1];
          
          skippedEvents.forEach(event => {
            if (onMatchEvent) onMatchEvent(event);
          });
          
          setCurrentEventIndex(timeline.indexOf(lastEvent));
          
          if ('homeScore' in lastEvent && 'awayScore' in lastEvent) {
            setScores({
              homeScore: lastEvent.homeScore ?? scores.homeScore,
              awayScore: lastEvent.awayScore ?? scores.awayScore
            });
          }
        }
      }
      
      return newTime;
    });
  }, [onMatchEvent, scores]);

  const resetTime = useCallback(() => {
    setMatchTime(0);
    setCurrentEventIndex(-1);
    setScores({ homeScore: 0, awayScore: 0 });
  }, []);

  return {
    matchTime,
    currentEventIndex,
    homeScore: scores.homeScore,
    awayScore: scores.awayScore,
    updateMatchTime,
    skipAhead,
    resetTime
  };
};
