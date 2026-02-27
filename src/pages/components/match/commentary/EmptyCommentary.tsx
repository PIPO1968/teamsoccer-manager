
import React from 'react';
import { Clock } from "lucide-react";

interface EmptyCommentaryProps {
  isFullTime: boolean;
}

const EmptyCommentary: React.FC<EmptyCommentaryProps> = ({ isFullTime }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <Clock className="h-12 w-12 text-muted-foreground opacity-50" />
      <p className="mt-2 text-center text-muted-foreground">
        {isFullTime 
          ? "No notable events in this match" 
          : "The match has not started yet"}
      </p>
    </div>
  );
};

export default EmptyCommentary;
