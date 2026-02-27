
import React from 'react';
import { PitchMarkingsProps } from '../types/matchTypes';

const PitchMarkings: React.FC<PitchMarkingsProps> = ({ 
  homeTeamColor = '#059669',
  awayTeamColor = '#e53e3e'
}) => {
  return (
    <>
      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
      
      {/* Center Dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Home Penalty Area */}
      <div className="absolute top-1/2 left-[10%] w-20 h-36 border-2 border-white -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
      
      {/* Home Goal */}
      <div 
        className="absolute top-1/2 left-[5%] w-1 h-16 -translate-x-1/2 -translate-y-1/2" 
        style={{ backgroundColor: homeTeamColor }}
      ></div>
      
      {/* Away Penalty Area */}
      <div className="absolute top-1/2 left-[90%] w-20 h-36 border-2 border-white -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
      
      {/* Away Goal */}
      <div 
        className="absolute top-1/2 left-[95%] w-1 h-16 -translate-x-1/2 -translate-y-1/2" 
        style={{ backgroundColor: awayTeamColor }}
      ></div>
    </>
  );
};

export default PitchMarkings;
