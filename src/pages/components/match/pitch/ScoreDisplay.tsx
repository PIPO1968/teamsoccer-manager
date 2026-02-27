
import React from 'react';
import { Clock } from "lucide-react";

interface ScoreDisplayProps {
  homeScore: number;
  awayScore: number;
  matchTime: number;
  formatMatchTime: (time: number) => string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  homeScore, 
  awayScore, 
  matchTime, 
  formatMatchTime 
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md flex items-center space-x-4 z-10">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="font-bold">SF</span>
        </div>
        <span className="text-xl font-bold mx-2">{homeScore}</span>
      </div>
      <div className="flex flex-col items-center">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">{formatMatchTime(matchTime)}</span>
      </div>
      <div className="flex items-center">
        <span className="text-xl font-bold mx-2">{awayScore}</span>
        <div className="w-8 h-8 bg-team-primary rounded-full flex items-center justify-center">
          <span className="font-bold">OP</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;
