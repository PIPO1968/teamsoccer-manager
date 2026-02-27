
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface MatchControlsProps {
  isPlaying: boolean;
  matchTime: number;
  matchSpeed: number;
  isHalfTime: boolean;
  isFullTime: boolean;
  onPlayPause: () => void;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  onSkip: () => void;
  onRestart: () => void;
}

const MatchControls: React.FC<MatchControlsProps> = ({
  isPlaying,
  matchSpeed,
  isFullTime,
  onPlayPause,
  onSpeedUp,
  onSpeedDown,
  onSkip,
  onRestart
}) => {
  // Speed values: 1x, 4x, 8x, 16x
  const speedValues = [1, 4, 8, 16];
  const currentSpeedIndex = speedValues.indexOf(matchSpeed);
  const canSpeedUp = currentSpeedIndex < speedValues.length - 1;
  const canSpeedDown = currentSpeedIndex > 0;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onSpeedDown}
        disabled={!canSpeedDown}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            console.log("Play/Pause button clicked, current isPlaying:", isPlaying);
            onPlayPause();
          }}
          disabled={isFullTime}
          className={isPlaying ? "bg-green-100" : ""}
        >
          {isPlaying ? (
            <><Pause className="h-4 w-4 mr-2" /> Pause</>
          ) : (
            <><Play className="h-4 w-4 mr-2" /> Play</>
          )}
        </Button>

        {/* Speed Display */}
        <div className="px-3 py-1 bg-secondary rounded text-sm font-medium min-w-[40px] text-center">
          {matchSpeed}x
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onSpeedUp}
        disabled={!canSpeedUp}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onSkip}
        disabled={isFullTime}
      >
        <SkipForward className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onRestart}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MatchControls;
