
import { Player } from '../../types/match';

interface PlayerPosition extends Player {
  x: number;
  y: number;
}

export const getPlayerPositions = (players: Player[], isHomeTeam: boolean): PlayerPosition[] => {
  const positions = [];
  const sortedPlayers = [...players].sort((a, b) => {
    const positionOrder = ['GK', 'CB', 'LB', 'RB', 'CM', 'LM', 'RM', 'LW', 'RW', 'ST'];
    return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
  });

  // Formation positions with better spacing
  const formationPositions = isHomeTeam ? [
    // Home team (left side)
    { x: 12, y: 50 }, // GK
    { x: 22, y: 25 }, // LB
    { x: 22, y: 40 }, // CB
    { x: 22, y: 60 }, // CB
    { x: 22, y: 75 }, // RB
    { x: 35, y: 35 }, // LM
    { x: 35, y: 50 }, // CM
    { x: 35, y: 65 }, // RM
    { x: 48, y: 25 }, // LW
    { x: 48, y: 50 }, // ST
    { x: 48, y: 75 }, // RW
  ] : [
    // Away team (right side)
    { x: 88, y: 50 }, // GK
    { x: 78, y: 25 }, // LB
    { x: 78, y: 40 }, // CB
    { x: 78, y: 60 }, // CB
    { x: 78, y: 75 }, // RB
    { x: 65, y: 35 }, // LM
    { x: 65, y: 50 }, // CM
    { x: 65, y: 65 }, // RM
    { x: 52, y: 25 }, // LW
    { x: 52, y: 50 }, // ST
    { x: 52, y: 75 }, // RW
  ];

  sortedPlayers.slice(0, 11).forEach((player, index) => {
    if (formationPositions[index]) {
      positions.push({
        ...player,
        x: formationPositions[index].x,
        y: formationPositions[index].y
      });
    }
  });

  return positions;
};
