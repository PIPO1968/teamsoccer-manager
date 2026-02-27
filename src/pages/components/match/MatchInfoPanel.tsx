
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, MapPin } from "lucide-react";
import { weatherTypes, WeatherType } from './engine/utils/weatherUtils';

interface MatchInfoPanelProps {
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  stadium?: string;
  weather?: string;
  stadiumId?: number;
  stadiumCapacity?: number;
}

const MatchInfoPanel: React.FC<MatchInfoPanelProps> = ({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  matchTime,
  stadium = "Stadium",
  weather = "sunny",
  stadiumId,
  stadiumCapacity = 15000
}) => {
  // Mock possession data - in a real app this would come from match stats
  const homePossession = 55;
  const awayPossession = 45;

  // Get weather info and icon
  const weatherInfo = weatherTypes[weather as WeatherType] || weatherTypes.sunny;
  const WeatherIcon = weatherInfo.icon;

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="py-4 px-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Match Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Weather */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Weather:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{weatherInfo.name}</span>
            <WeatherIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Stadium */}
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Stadium:</span>
            </div>
            <div className="text-right">
              {stadiumId ? (
                <Link 
                  to={`/stadium/${stadiumId}`} 
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {stadium}
                </Link>
              ) : (
                <span className="font-medium">{stadium}</span>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              Total capacity: {stadiumCapacity?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Possession */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm font-medium">
            <span>Possession</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs w-8">{homePossession}%</span>
            <div className="flex-1 flex">
              <div 
                className="h-2 bg-blue-500 rounded-l" 
                style={{ width: `${homePossession}%` }}
              />
              <div 
                className="h-2 bg-red-500 rounded-r" 
                style={{ width: `${awayPossession}%` }}
              />
            </div>
            <span className="text-xs w-8">{awayPossession}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchInfoPanel;
