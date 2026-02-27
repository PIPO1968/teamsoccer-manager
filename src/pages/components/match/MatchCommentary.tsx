
import React from 'react';
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchEventData } from './types/matchTypes';
import { useMatchContext } from './MatchContext';
import CommentaryEvent from './commentary/CommentaryEvent';
import EmptyCommentary from './commentary/EmptyCommentary';
import { MessageSquare } from 'lucide-react';

interface MatchCommentaryProps {
  matchEvents: MatchEventData[];
  isFullTime: boolean;
  matchId?: number;
  onPlayerClick?: (playerId: number) => void;
}

const MatchCommentary: React.FC<MatchCommentaryProps> = ({ 
  matchEvents, 
  isFullTime, 
  matchId,
  onPlayerClick 
}) => {
  const matchContext = useMatchContext();
  const currentMatchTime = matchContext?.matchTime || 0;

  // Filter events to only show those that have occurred based on the match time
  const visibleEvents = matchEvents.filter(event => event.minute <= currentMatchTime);

  // Reverse the order to show newest events at the top
  const reversedEvents = [...visibleEvents].reverse();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-4 px-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Live Commentary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="h-full">
            {reversedEvents.length === 0 ? (
              <div className="p-4">
                <EmptyCommentary isFullTime={isFullTime} />
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {reversedEvents.map((event, index) => (
                  <CommentaryEvent 
                    key={index}
                    event={event}
                    onPlayerClick={onPlayerClick}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};

export default MatchCommentary;
