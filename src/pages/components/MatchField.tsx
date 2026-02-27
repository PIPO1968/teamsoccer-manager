
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Player } from './types/match';
import PitchMarkings from './pitch/PitchMarkings';
import PlayerMarker from './pitch/PlayerMarker';
import ScoreDisplay from './pitch/ScoreDisplay';

interface MatchFieldProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeScore: number;
  awayScore: number;
  matchTime: number;
  animate?: boolean;
  playerPositions?: {[key: number]: {x: number, y: number}};
  getPlayerPosition?: (position: string) => { row: number; col: number };
  getFormColor?: (form: string) => string;
  formatMatchTime?: (time: number) => string;
  homeTeamColor?: string;
  awayTeamColor?: string;
}

const MatchField: React.FC<MatchFieldProps> = ({
  homePlayers,
  awayPlayers,
  homeScore,
  awayScore,
  matchTime,
  getPlayerPosition,
  getFormColor,
  formatMatchTime,
  animate,
  playerPositions,
  homeTeamColor = '#059669',
  awayTeamColor = '#e53e3e'
}) => {
  useEffect(() => {
    if (!playerPositions) return;
    console.log("Player positions updated", Object.keys(playerPositions).length);
  }, [playerPositions]);

  // Use provided functions or use defaults
  const formatTime = formatMatchTime || ((time: number) => {
    const minutes = Math.floor(time);
    const seconds = Math.floor((time - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  });

  const getColor = getFormColor || ((form: string): string => {
    switch (form) {
      case 'Excellent': return '#22c55e';
      case 'Good': return '#84cc16';
      case 'Average': return '#facc15';
      case 'Poor': return '#f97316';
      case 'Terrible': return '#ef4444';
      default: return '#facc15';
    }
  });

  return (
    <div className="stadium-background rounded-xl aspect-[16/9] w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pitch-background rounded-xl w-4/5 h-4/5 flex flex-col relative">
          <PitchMarkings />
          
          <ScoreDisplay
            homeScore={homeScore}
            awayScore={awayScore}
            matchTime={matchTime}
            formatMatchTime={formatTime}
          />
          
          {/* Ball */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md z-10"></div>
          
          {/* Players */}
          {homePlayers.map((player) => {
            const xPos = playerPositions && playerPositions[player.id] ? playerPositions[player.id].x : player.x;
            const yPos = playerPositions && playerPositions[player.id] ? playerPositions[player.id].y : player.y;
            const updatedPlayer = { ...player, x: xPos, y: yPos };
            
            return (
              <PlayerMarker
                key={player.id}
                player={updatedPlayer}
                isHomeTeam={true}
                getFormColor={getColor}
              />
            );
          })}
          
          {awayPlayers.map((player) => {
            const xPos = playerPositions && playerPositions[player.id] ? playerPositions[player.id].x : player.x;
            const yPos = playerPositions && playerPositions[player.id] ? playerPositions[player.id].y : player.y;
            const updatedPlayer = { ...player, x: xPos, y: yPos };
            
            return (
              <PlayerMarker
                key={player.id}
                player={updatedPlayer}
                isHomeTeam={false}
                getFormColor={getColor}
              />
            );
          })}
        </div>
      </div>
      
      <style>{`
        .stadium-background {
          background: linear-gradient(to bottom, #4a5568, #2d3748);
          position: relative;
        }
        .pitch-background {
          background: linear-gradient(to bottom, #48bb78, #38a169);
          position: relative;
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          border: 2px solid white;
        }
        .pitch-background::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 0px;
          background: rgba(255,255,255,0.7);
        }
        .pitch-background::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(255,255,255,0.7);
        }
        .bg-team-primary {
          background-color: #e53e3e;
        }
      `}</style>
    </div>
  );
};

export default MatchField;
