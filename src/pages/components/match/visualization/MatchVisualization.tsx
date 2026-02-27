
import React, { useRef, useEffect, useState } from 'react';
import { useMatchContext } from '../MatchContext';
import { Card } from '@/components/ui/card';
import { MatchEventData } from '../types/matchTypes';
import { drawField, drawPlayers, drawBall, drawEvent } from './renderers/fieldRenderer';
import { Player } from '../../../components/types/match';

interface MatchVisualizationProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamColor?: string;
  awayTeamColor?: string;
  onPlayerClick?: (playerId: number) => void;
}

const MatchVisualization: React.FC<MatchVisualizationProps> = ({
  homePlayers,
  awayPlayers,
  homeTeamColor = '#3b82f6',
  awayTeamColor = '#ef4444',
  onPlayerClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { 
    matchTime, 
    homeScore, 
    awayScore, 
    isPlaying,
    matchEvents, 
    playerPositions,
    weather
  } = useMatchContext();
  
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [currentAnimation, setCurrentAnimation] = useState<{
    event: MatchEventData | null;
    progress: number;
    duration: number;
  }>({ event: null, progress: 0, duration: 0 });
  
  // Setup the canvas and initialize the renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size based on parent container with a fixed aspect ratio
    const container = canvas.parentElement;
    if (!container) return;
    
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      canvas.width = containerWidth;
      canvas.height = containerWidth * 0.65; // 2:3 aspect ratio for soccer field
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Main render loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let lastTimestamp = 0;
    
    const render = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw field with weather effects
      drawField(ctx, canvas.width, canvas.height, weather);
      
      // Update animation progress
      if (currentAnimation.event && isPlaying) {
        setCurrentAnimation(prev => {
          const newProgress = prev.progress + (deltaTime / prev.duration);
          if (newProgress >= 1) {
            // Animation complete
            return { event: null, progress: 0, duration: 0 };
          }
          return { ...prev, progress: newProgress };
        });
      }
      
      // Find latest event based on match time
      const relevantEvents = matchEvents.filter(event => event.minute <= matchTime);
      const latestEvent = relevantEvents.length > 0 ? relevantEvents[relevantEvents.length - 1] : null;
      
      // Update ball position based on event or currentAnimation
      let ballPos = ballPosition;
      if (currentAnimation.event && currentAnimation.event.positions) {
        // Ball should follow animation
        const ballData = calculateBallPositionFromEvent(currentAnimation.event, currentAnimation.progress);
        if (ballData) {
          ballPos = ballData;
        }
      } else if (latestEvent && latestEvent.positions && !currentAnimation.event) {
        // Position ball based on latest event
        const ballData = calculateBallPositionFromEvent(latestEvent, 1);
        if (ballData && ballData !== ballPos) {
          setBallPosition(ballData);
          ballPos = ballData;
        }
      }
      
      // Draw players based on positions
      drawPlayers(
        ctx, 
        canvas.width, 
        canvas.height, 
        homePlayers, 
        awayPlayers, 
        playerPositions || {},
        homeTeamColor,
        awayTeamColor
      );
      
      // Draw ball
      drawBall(ctx, canvas.width, canvas.height, ballPos.x, ballPos.y);
      
      // Draw any active event animation
      if (currentAnimation.event) {
        drawEvent(
          ctx, 
          canvas.width, 
          canvas.height, 
          currentAnimation.event, 
          currentAnimation.progress,
          ballPos,
          playerPositions || {}
        );
      }
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    animationRef.current = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [matchTime, isPlaying, matchEvents, playerPositions, homePlayers, awayPlayers, currentAnimation, ballPosition, homeTeamColor, awayTeamColor, weather]);
  
  // Start animation when a new event occurs
  useEffect(() => {
    if (matchEvents.length > 0 && isPlaying) {
      const currentMinute = Math.floor(matchTime);
      const eventsAtCurrentMinute = matchEvents.filter(event => 
        Math.floor(event.minute) === currentMinute && 
        event.type !== 'commentary' &&
        event.type !== 'possession'
      );
      
      if (eventsAtCurrentMinute.length > 0 && !currentAnimation.event) {
        // Get the last event at the current minute
        const eventToAnimate = eventsAtCurrentMinute[eventsAtCurrentMinute.length - 1];
        
        // Start animation for this event
        setCurrentAnimation({
          event: eventToAnimate,
          progress: 0,
          duration: getAnimationDurationForEvent(eventToAnimate.type)
        });
      }
    }
  }, [matchEvents, matchTime, isPlaying, currentAnimation.event]);
  
  // Handle clicks on the canvas (for player selection)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onPlayerClick) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;
    
    // Check if click is on a player
    const clickedPlayer = findPlayerAtPosition(x, y, homePlayers, awayPlayers, playerPositions || {});
    if (clickedPlayer) {
      onPlayerClick(clickedPlayer.id);
    }
  };
  
  return (
    <Card className="w-full mb-4 overflow-hidden">
      <div className="w-full h-full p-3">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full rounded-md shadow"
        />
      </div>
    </Card>
  );
};

// Helper functions
const calculateBallPositionFromEvent = (
  event: MatchEventData, 
  progress: number
): { x: number, y: number } | null => {
  if (!event.positions || event.positions.positions.length === 0) {
    return null;
  }
  
  // For now, just return an approximation based on the event type and position
  const positions = event.positions.positions;
  
  // For events like shots, passes, etc., we can calculate the ball trajectory
  if (event.type === 'goal' || event.type === 'shot') {
    // Find the player's position
    const playerPos = positions.find(p => p.id === event.playerId);
    
    if (playerPos) {
      // For goals, animate the ball toward the goal
      if (event.type === 'goal') {
        const targetX = event.team === 'home' ? 95 : 5; // Goal position
        const targetY = 50; // Center of goal
        
        return {
          x: playerPos.x + (targetX - playerPos.x) * progress,
          y: playerPos.y + (targetY - playerPos.y) * progress
        };
      }
      
      // For shots, animate in the direction of the shot
      return {
        x: playerPos.x,
        y: playerPos.y
      };
    }
  }
  
  // Default position in the middle of the field
  return { x: 50, y: 50 };
};

const getAnimationDurationForEvent = (eventType: string): number => {
  switch (eventType) {
    case 'goal':
      return 2000; // 2 seconds for goal animation
    case 'shot':
      return 1000; // 1 second for shot animation
    case 'yellow_card':
    case 'red_card':
      return 1500; // 1.5 seconds for card animations
    default:
      return 1000; // Default animation duration
  }
};

const findPlayerAtPosition = (
  x: number,
  y: number,
  homePlayers: Player[],
  awayPlayers: Player[],
  positions: {[key: number]: {x: number, y: number}}
): Player | null => {
  const allPlayers = [...homePlayers, ...awayPlayers];
  
  // Check if click is within player radius
  for (const player of allPlayers) {
    const playerPos = positions[player.id];
    if (playerPos) {
      const distance = Math.sqrt(
        Math.pow(x - playerPos.x, 2) + Math.pow(y - playerPos.y, 2)
      );
      
      // If click is within 5% of the field size from player center
      if (distance < 5) {
        return player;
      }
    }
  }
  
  return null;
};

export default MatchVisualization;
