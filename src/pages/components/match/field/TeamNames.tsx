
import React from 'react';

interface TeamNamesProps {
  homeTeamName: string;
  awayTeamName: string;
}

const TeamNames: React.FC<TeamNamesProps> = ({ homeTeamName, awayTeamName }) => {
  return (
    <>
      <div className="absolute top-2 left-1/4 transform -translate-x-1/2 z-10">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
          {homeTeamName}
        </div>
      </div>
      <div className="absolute top-2 right-1/4 transform translate-x-1/2 z-10">
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-white">
          {awayTeamName}
        </div>
      </div>
    </>
  );
};

export default TeamNames;
