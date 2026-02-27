
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import type { MatchDetails } from '@/hooks/useMatchDetails';
import { formatMatchTime } from '../../utils/matchHelpers';
import { Cloud, CloudRain, Sun, CloudSun } from "lucide-react";
import { weatherTypes } from './engine/utils/weatherUtils';

interface MatchHeaderProps {
  match: MatchDetails;
  homeScore: number;
  awayScore: number;
  matchTime: number;
  isCompleted: boolean;
  isUpcoming: boolean;
  weather?: string;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({
  match,
  homeScore,
  awayScore,
  matchTime,
  isCompleted,
  isUpcoming,
  weather
}) => {
  console.log("MatchHeader received scores:", { homeScore, awayScore, matchTime });
  
  const displayMatchTime = () => {
    if (isUpcoming) return 'Not started';
    if (isCompleted) return 'Match completed';
    
    return formatMatchTime(matchTime);
  };
  
  const getWeatherIcon = () => {
    if (!weather) return null;
    
    const weatherInfo = weatherTypes[weather as keyof typeof weatherTypes];
    if (!weatherInfo) return null;
    
    const IconComponent = weatherInfo.icon;
    return (
      <div className="flex items-center" title={weatherInfo.description}>
        <IconComponent className="h-4 w-4 mr-1" />
        <span className="text-xs">{weatherInfo.name}</span>
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-1 items-center justify-end">
            <div className="text-right mr-3">
              <Link to={`/team/${match.home_team_id}`} className="hover:underline">
                <p className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                  {match.home_team_name}
                </p>
              </Link>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {match.home_team_logo ? (
                <img 
                  src={match.home_team_logo} 
                  alt={`${match.home_team_name} logo`} 
                  className="max-h-10 max-w-10 object-contain"
                />
              ) : (
                <span className="text-xl font-bold">{match.home_team_name?.charAt(0)}</span>
              )}
            </div>
          </div>
          
          <div className="mx-6 text-center">
            <div className="flex justify-center items-center space-x-3">
              <span className="text-2xl font-bold">{homeScore}</span>
              <span className="text-gray-500">:</span>
              <span className="text-2xl font-bold">{awayScore}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {displayMatchTime()}
            </div>
            {match.stadium_name && (
              <div className="text-xs text-gray-400 mt-1">
                <Link 
                  to={`/stadium/${match.stadium_id}`} 
                  className="hover:underline hover:text-gray-600"
                >
                  {match.stadium_name}
                </Link>
              </div>
            )}
            {getWeatherIcon() && (
              <div className="mt-1">
                {getWeatherIcon()}
              </div>
            )}
          </div>
          
          <div className="flex flex-1 items-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {match.away_team_logo ? (
                <img 
                  src={match.away_team_logo} 
                  alt={`${match.away_team_name} logo`} 
                  className="max-h-10 max-w-10 object-contain"
                />
              ) : (
                <span className="text-xl font-bold">{match.away_team_name?.charAt(0)}</span>
              )}
            </div>
            <div className="text-left ml-3">
              <Link to={`/team/${match.away_team_id}`} className="hover:underline">
                <p className="font-semibold text-lg text-blue-600 hover:text-blue-800">
                  {match.away_team_name}
                </p>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchHeader;
