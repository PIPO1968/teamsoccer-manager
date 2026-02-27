
import React from 'react';

interface EventStyleProps {
  type: string;
  children: React.ReactNode;
}

const EventStyle: React.FC<EventStyleProps> = ({ type, children }) => {
  const getEventStyle = (eventType: string) => {
    switch (eventType) {
      case 'goal': return 'border-green-500 bg-green-50 text-green-800';
      case 'yellow_card': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'red_card': return 'border-red-500 bg-red-50 text-red-800';
      case 'injury': return 'border-red-300 bg-red-50 text-red-800';
      case 'corner': return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'shot': return 'border-orange-300 bg-orange-50 text-orange-800';
      case 'shot_on_target': return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'save': return 'border-purple-300 bg-purple-50 text-purple-800';
      case 'foul': return 'border-red-300 bg-red-50 text-red-800';
      case 'offside': return 'border-amber-300 bg-amber-50 text-amber-800';
      case 'substitution': return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'half_time': return 'border-gray-500 bg-gray-50 text-gray-800';
      case 'full_time': return 'border-gray-500 bg-gray-50 text-gray-800';
      default: return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className={`p-3 rounded-md border-l-4 ${getEventStyle(type)}`}>
      {children}
    </div>
  );
};

export default EventStyle;
