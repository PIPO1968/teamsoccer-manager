
import React from 'react';
import { Card } from '@/components/ui/card';
import { Player } from '../types/match';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getPlayerPositions } from './utils/FormationPositions';
import StadiumBackground from './field/StadiumBackground';
import SoccerField from './field/SoccerField';
import TeamNames from './field/TeamNames';
import PlayerOnField from './field/PlayerOnField';

interface StaticMatchFieldProps {
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTeamName: string;
  awayTeamName: string;
  onPlayerClick?: (player: Player) => void;
}

const StaticMatchField: React.FC<StaticMatchFieldProps> = ({
  homePlayers,
  awayPlayers,
  homeTeamName,
  awayTeamName,
  onPlayerClick
}) => {
  const homePositions = getPlayerPositions(homePlayers, true);
  const awayPositions = getPlayerPositions(awayPlayers, false);

  return (
    <Card className="w-full overflow-hidden shadow-lg">
      <div className="w-full max-w-4xl mx-auto aspect-[16/10] p-4 relative">
        {/* Stadium background with 3D effect */}
        <StadiumBackground />
        
        {/* Field container with 3D perspective */}
        <SoccerField />

        {/* Team names with improved styling */}
        <TeamNames homeTeamName={homeTeamName} awayTeamName={awayTeamName} />

        <TooltipProvider>
          {/* Home team players */}
          {homePositions.map((player) => (
            <PlayerOnField
              key={`home-${player.id}`}
              player={player}
              isHomeTeam={true}
              onPlayerClick={onPlayerClick}
            />
          ))}

          {/* Away team players */}
          {awayPositions.map((player) => (
            <PlayerOnField
              key={`away-${player.id}`}
              player={player}
              isHomeTeam={false}
              onPlayerClick={onPlayerClick}
            />
          ))}
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default StaticMatchField;
