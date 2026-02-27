
import React from 'react';
import { cn } from "@/lib/utils";

interface PitchMarkingsProps {
  className?: string;
}

const PitchMarkings: React.FC<PitchMarkingsProps> = ({ className }) => {
  return (
    <>
      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/60"></div>
      
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/70"></div>
      
      {/* Left penalty area */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-64 border-r-2 border-t-2 border-b-2 border-white/70"></div>
      
      {/* Left goal area */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-32 border-r-2 border-t-2 border-b-2 border-white/70"></div>
      
      {/* Left goal */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-20 border-r-4 border-t-4 border-b-4 border-white bg-white/10"></div>
      
      {/* Right penalty area */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-64 border-l-2 border-t-2 border-b-2 border-white/70"></div>
      
      {/* Right goal area */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-32 border-l-2 border-t-2 border-b-2 border-white/70"></div>
      
      {/* Right goal */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-20 border-l-4 border-t-4 border-b-4 border-white bg-white/10"></div>
      
      {/* Penalty spots */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80"></div>
      <div className="absolute right-16 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80"></div>
      
      {/* Corner arcs */}
      <div className="absolute top-0 left-0 w-6 h-6 border-b-2 border-r-2 rounded-br-full border-white/70"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-full border-white/70"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-full border-white/70"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-full border-white/70"></div>
    </>
  );
};

export default PitchMarkings;
