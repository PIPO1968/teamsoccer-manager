
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";
import { Player } from '../types/match';
import { PlayerAvatar } from '@/components/avatar/PlayerAvatar';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { convertToPlayerData } from './utils/PlayerConversionUtils';
import { Flag } from "@/components/ui/flag";

interface PlayerInfoPanelProps {
  player: Player | null;
  onClose: () => void;
}

const PlayerInfoPanel: React.FC<PlayerInfoPanelProps> = ({ player, onClose }) => {
  if (!player) return null;

  // Use the real PlayerData if available, otherwise convert from Player
  const playerData = player.playerData || convertToPlayerData(player);

  const formatMoney = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const formatForm = (form: string) => {
    switch (form) {
      case "Excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Average":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Poor":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSkillColor = (level: number) => {
    if (level >= 15) return "bg-violet-500";
    if (level >= 12) return "bg-blue-500";
    if (level >= 9) return "bg-green-500";
    if (level >= 6) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-2 px-4 py-3 bg-green-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <CardTitle className="text-base font-medium">Player Info</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-green-700 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <PlayerAvatar 
              player={playerData} 
              size="md" 
              className="w-16 h-16"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm text-primary">{playerData.position}</span>
              <a 
                href={`/players/${player.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-blue-600 underline cursor-pointer truncate hover:text-blue-800 transition-colors"
              >
                {player.name}
              </a>
              <Flag country={playerData.nationality} />
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{playerData.age}y</span>
                <span>•</span>
                <span>{formatMoney(playerData.wage)}/w</span>
                <span>•</span>
                <span>{playerData.matches_played} matches</span>
              </div>
              <Badge variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 text-xs">
                {Math.round((playerData.finishing + playerData.pace + playerData.passing + playerData.defense) / 4)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-1">
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${formatForm(playerData.form)}`}>
                {playerData.form}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Fitness: {playerData.fitness}%
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                Goals: {playerData.goals}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                {formatMoney(playerData.value)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Player Attributes</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              { skill: "finishing", value: playerData.finishing },
              { skill: "pace", value: playerData.pace },
              { skill: "passing", value: playerData.passing },
              { skill: "defense", value: playerData.defense },
              { skill: "dribbling", value: playerData.dribbling },
              { skill: "heading", value: playerData.heading },
              { skill: "stamina", value: playerData.stamina }
            ].map(({ skill, value }) => (
              <div key={skill} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 w-16 capitalize">
                  {skill}
                </span>
                <div className="flex-1">
                  <Progress 
                    value={(value / 20) * 100} 
                    className="h-2 bg-slate-200"
                    indicatorClassName={getSkillColor(value)}
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 w-6 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerInfoPanel;
