
import React from 'react';
import { Cloud, CloudRain, Sun } from 'lucide-react';

interface EventIconProps {
  type: string;
}

const EventIcon: React.FC<EventIconProps> = ({ type }) => {
  switch (type) {
    case 'goal': return '⚽';
    case 'yellow_card': return '🟨';
    case 'red_card': return '🟥';
    case 'injury': return '🩹';
    case 'corner': return '🚩';
    case 'shot': return '👟';
    case 'shot_on_target': return '🎯';
    case 'save': return '🧤';
    case 'foul': return '😡';
    case 'offside': return '🏴';
    case 'substitution': return '🔄';
    case 'half_time': return '⏱️';
    case 'full_time': return '⏰';
    case 'weather': return '🌤️';
    default: return '•';
  }
};

export default EventIcon;
