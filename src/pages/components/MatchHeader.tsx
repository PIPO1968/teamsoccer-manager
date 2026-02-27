
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchDetails } from "@/hooks/useMatchDetails";
import { formatMatchTime } from "../utils/matchHelpers";
import { Cloud, CloudRain, Sun } from "lucide-react";
import { weatherTypes } from "./match/engine/utils/weatherUtils";

interface MatchHeaderProps {
  match: MatchDetails;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isCompleted?: boolean;
  isUpcoming?: boolean;
  weather?: string;
}

const MatchHeader = ({ match, homeScore, awayScore, matchTime, isCompleted, isUpcoming, weather }: MatchHeaderProps) => {
  // Render weather icon if available
  const renderWeatherIcon = () => {
    if (weather && weatherTypes[weather as keyof typeof weatherTypes]) {
      const WeatherIcon = weatherTypes[weather as keyof typeof weatherTypes].icon;
      return (
        <div className="flex items-center gap-1 text-xs">
          <WeatherIcon className="h-3 w-3" />
          <span>{weatherTypes[weather as keyof typeof weatherTypes].name}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-muted p-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-600 text-white font-bold text-xl"
          >
            {match.home_team_logo ? (
              <img src={match.home_team_logo} alt={match.home_team_name} className="w-12 h-12" />
            ) : (
              match.home_team_name?.substring(0, 2)
            )}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">{match.home_team_name}</h2>
            <p className="text-sm text-muted-foreground">Home</p>
          </div>
        </div>
        
        <div className="my-4 md:my-0 flex flex-col items-center">
          <Badge className="mb-2">{match.competition}</Badge>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{homeScore}</span>
            <span className="text-lg">-</span>
            <span className="text-2xl font-bold">{awayScore}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {isUpcoming ? "Match not started" : 
             isCompleted ? "Full Time" : 
             formatMatchTime(matchTime)}
          </p>
          {renderWeatherIcon()}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center md:text-right">
            <h2 className="text-xl font-bold">{match.away_team_name}</h2>
            <p className="text-sm text-muted-foreground">Away</p>
          </div>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-rose-600 text-white font-bold text-xl"
          >
            {match.away_team_logo ? (
              <img src={match.away_team_logo} alt={match.away_team_name} className="w-12 h-12" />
            ) : (
              match.away_team_name?.substring(0, 2)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchHeader;
