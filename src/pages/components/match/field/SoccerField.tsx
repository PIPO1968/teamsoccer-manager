
import React from 'react';

const SoccerField: React.FC = () => {
  return (
    <div className="absolute inset-4 rounded-lg shadow-lg overflow-hidden">
      {/* High-quality soccer field with proper scaling */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
        style={{
          backgroundImage: 'url(/lovable-uploads/a18883e3-0548-4195-83d0-df1fffc1748a.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          imageRendering: 'crisp-edges'
        }}
      >
        {/* Subtle overlay for better contrast and crispness */}
        <div className="absolute inset-0 bg-black bg-opacity-5 rounded-lg"></div>
        
        {/* Additional field markings overlay for better visibility */}
        <div className="absolute inset-0 rounded-lg">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/40"></div>
          
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>
          
          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60"></div>
          
          {/* Goals for better visibility */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-white/80 rounded-r"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-white/80 rounded-l"></div>
        </div>
      </div>
    </div>
  );
};

export default SoccerField;
