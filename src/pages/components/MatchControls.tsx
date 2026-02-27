
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, FastForward, Rewind, SkipForward, RotateCw } from "lucide-react";
import { formatMatchTime } from "../utils/matchHelpers";

interface MatchControlsProps {
  isPlaying: boolean;
  matchTime: number;
  matchSpeed: number;
  isHalfTime: boolean;
  onPlayPause: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onSkip: () => void;
  onRestart: () => void;
}

const MatchControls: React.FC<MatchControlsProps> = ({
  isPlaying,
  matchTime,
  matchSpeed,
  isHalfTime,
  onPlayPause,
  onSpeedUp,
  onSpeedDown,
  onSkip,
  onRestart,
}) => {
  console.log("MatchControls rendering with isPlaying:", isPlaying);
  
  // Debugging effect to monitor play status
  useEffect(() => {
    console.log(`MatchControls useEffect - isPlaying changed to: ${isPlaying}`);
    
    // Return cleanup function
    return () => {
      console.log("MatchControls useEffect cleanup");
    };
  }, [isPlaying]);
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-center">
        <div className="text-xl font-bold px-4 py-1 bg-primary/10 rounded-md">
          {formatMatchTime(matchTime)}
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          disabled={matchTime >= 90 && !isHalfTime}
          className={isPlaying ? "bg-green-100" : ""}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onSpeedDown}
          disabled={matchSpeed <= 1}
        >
          <Rewind className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onSpeedUp}
          disabled={matchSpeed >= 3}
          className={matchSpeed > 1 ? "bg-yellow-100" : ""}
        >
          <FastForward className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
          disabled={matchTime >= 90}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onRestart}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MatchControls;
