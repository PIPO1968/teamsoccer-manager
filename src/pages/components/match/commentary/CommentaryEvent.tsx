
import React from 'react';
import { MatchEventData } from '../types/matchTypes';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventStyle from './EventStyle';
import EventIcon from './EventIcon';
import EventDescription from './EventDescription';
import { weatherTypes } from '../engine/utils/weatherUtils';
import { Cloud, CloudRain, Sun } from 'lucide-react';

interface CommentaryEventProps {
  event: MatchEventData;
  onPlayerClick?: (playerId: number) => void;
}

const CommentaryEvent: React.FC<CommentaryEventProps> = ({ event, onPlayerClick }) => {
  // Use the actual team name or fallback to a generic name
  const teamDisplayName = event.teamName || (event.team === "home" ? "Home Team" : "Away Team");
  
  // Render weather icon if it's a weather event
  const renderWeatherIcon = () => {
    if (event.type === 'weather' && event.weather) {
      const weatherType = event.weather as keyof typeof weatherTypes;
      if (weatherTypes[weatherType]) {
        const WeatherIcon = weatherTypes[weatherType].icon;
        return <WeatherIcon className="h-5 w-5 mr-1" />;
      }
    }
    return <EventIcon type={event.type} />;
  };
  
  return (
    <EventStyle type={event.type}>
      <div className="flex items-start">
        <div className="bg-white border rounded px-2 py-0.5 text-sm font-medium mr-3">
          {Math.floor(event.minute)}'
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {event.teamLogo || event.team ? (
              <Avatar className="h-5 w-5">
                {event.teamLogo ? (
                  <AvatarImage src={event.teamLogo} alt={teamDisplayName} />
                ) : null}
                <AvatarFallback className={event.team === "home" ? "bg-emerald-600 text-white text-xs" : "bg-rose-600 text-white text-xs"}>
                  {event.teamName ? event.teamName.substring(0, 2) : event.team === "home" ? "H" : "A"}
                </AvatarFallback>
              </Avatar>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {teamDisplayName}
            </p>
          </div>
          <p className="font-medium">
            <span className="inline-flex items-center">
              {renderWeatherIcon()} <EventDescription description={event.description || ''} onPlayerClick={onPlayerClick} />
            </span>
          </p>
        </div>
      </div>
    </EventStyle>
  );
};

export default CommentaryEvent;
