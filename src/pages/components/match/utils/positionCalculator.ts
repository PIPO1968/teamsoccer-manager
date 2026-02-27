
import { MatchEventPosition } from '../../types/matchTypes';

export const generatePositionsForBuildUp = (
  team: "home" | "away",
  homePlayers: any[],
  awayPlayers: any[],
  previousPositions?: any,
  activePlayerId?: number
): MatchEventPosition => {
  const allPlayers = [...homePlayers, ...awayPlayers];
  
  const positions: MatchEventPosition = {
    positions: allPlayers.map(p => {
      const isHomeTeam = homePlayers.some(hp => hp.id === p.id);
      const isActivePlayer = p.id === activePlayerId;
      
      if (isActivePlayer) {
        return {
          id: p.id,
          x: isHomeTeam ? 30 : 70,
          y: 50
        };
      }
      
      return {
        id: p.id,
        x: p.x,
        y: p.y
      };
    })
  };
  
  return positions;
};

export const generatePositionsForAdvancingAttack = (
  team: "home" | "away",
  homePlayers: any[],
  awayPlayers: any[],
  previousPositions?: any,
  activePlayerId?: number
): MatchEventPosition => {
  const allPlayers = [...homePlayers, ...awayPlayers];
  
  const positions: MatchEventPosition = {
    positions: allPlayers.map(p => {
      const isHomeTeam = homePlayers.some(hp => hp.id === p.id);
      const isActivePlayer = p.id === activePlayerId;
      const isAttackingTeam = isHomeTeam === (team === "home");
      
      if (isActivePlayer) {
        return {
          id: p.id,
          x: team === "home" ? 70 : 30,
          y: 20 + Math.random() * 60
        };
      }
      
      if (isAttackingTeam && p.position.includes("F")) {
        return {
          id: p.id,
          x: team === "home" ? 65 : 35,
          y: 30 + Math.random() * 40
        };
      }
      
      // Small random movement for other players
      const prevPos = previousPositions?.positions?.find((pos: any) => pos.id === p.id);
      const baseX = prevPos ? prevPos.x : p.x;
      const baseY = prevPos ? prevPos.y : p.y;
      
      return {
        id: p.id,
        x: baseX + (Math.random() * 10 - 5),
        y: baseY + (Math.random() * 10 - 5)
      };
    })
  };
  
  return positions;
};

export const generatePositionsForShot = (
  team: "home" | "away",
  homePlayers: any[],
  awayPlayers: any[],
  previousPositions?: any,
  activePlayerId?: number,
  isGoal: boolean = false
): MatchEventPosition => {
  const allPlayers = [...homePlayers, ...awayPlayers];
  
  const positions: MatchEventPosition = {
    positions: allPlayers.map(p => {
      const isHomeTeam = homePlayers.some(hp => hp.id === p.id);
      const isActivePlayer = p.id === activePlayerId;
      const isGK = p.position === "GK";
      const isDefendingGK = isGK && isHomeTeam !== (team === "home");
      
      if (isActivePlayer) {
        return {
          id: p.id,
          x: team === "home" ? 85 : 15,
          y: 45 + (Math.random() * 10 - 5)
        };
      }
      
      if (isDefendingGK) {
        return {
          id: p.id,
          x: team === "home" ? 95 : 5,
          y: 50
        };
      }
      
      // Small random movement for other players
      const prevPos = previousPositions?.positions?.find((pos: any) => pos.id === p.id);
      const baseX = prevPos ? prevPos.x : p.x;
      const baseY = prevPos ? prevPos.y : p.y;
      
      return {
        id: p.id,
        x: baseX + (Math.random() * 5 - 2.5),
        y: baseY + (Math.random() * 5 - 2.5)
      };
    })
  };
  
  return positions;
};
