
import React from 'react';

const StadiumBackground: React.FC = () => {
  return (
    <div className="absolute inset-4 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 rounded-lg shadow-inner">
      {/* Stadium crowd */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-200 via-red-300 to-yellow-300 rounded-lg opacity-60"></div>
    </div>
  );
};

export default StadiumBackground;
