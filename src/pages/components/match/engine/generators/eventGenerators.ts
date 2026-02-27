import { MatchEventData } from "../../types/matchTypes";
import { Player } from "../../../../components/types/match";
import { generateEventDescription, generateStateCommentary } from "../utils/eventDescriptionGenerator";
import { EventGenerator, GameState, MatchEventGeneratorOptions, FieldPosition } from "../types/engineTypes";

/**
 * Collection of event generators for different event types
 */
export const eventGenerators: { [key: string]: EventGenerator } = {
  goal: {
    type: "goal",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "goal",
        team,
        description: generateEventDescription("goal", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  shot: {
    type: "shot",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "shot",
        team,
        description: generateEventDescription("shot", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  save: {
    type: "save",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "save",
        team,
        description: generateEventDescription("save", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  corner: {
    type: "corner",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "corner",
        team,
        description: generateEventDescription("corner", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  foul: {
    type: "foul",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "foul",
        team,
        description: generateEventDescription("foul", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  yellow_card: {
    type: "yellow_card",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "yellow_card",
        team,
        description: generateEventDescription("yellowCard", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  red_card: {
    type: "red_card",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "red_card",
        team,
        description: generateEventDescription("redCard", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  injury: {
    type: "injury",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "injury",
        team,
        description: generateEventDescription("injury", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  pass: {
    type: "possession",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "possession",
        team,
        description: generateEventDescription("pass", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  dribble: {
    type: "possession",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "possession",
        team,
        description: generateEventDescription("dribble", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  tackle: {
    type: "possession",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "possession",
        team,
        description: generateEventDescription("tackle", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  outOfField: {
    type: "commentary",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "commentary",
        team,
        description: generateEventDescription("outOfField", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  throwIn: {
    type: "commentary",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "commentary",
        team,
        description: generateEventDescription("throwIn", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  buildup: {
    type: "commentary",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "commentary",
        team,
        description: generateEventDescription("buildup", playerName, team, teamName),
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  },
  commentary: {
    type: "commentary",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      
      return {
        minute,
        type: "commentary",
        team,
        description: `${teamName || (team === 'home' ? 'Home Team' : 'Away Team')} is starting an attack!`,
        teamName,
        teamLogo
      };
    }
  },
  kick_off: {
    type: "kick_off",
    generate: (minute, team, player, options) => {
      const teamName = team === 'home' ? options?.homeTeamName : options?.awayTeamName;
      const teamLogo = team === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
      const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
      
      return {
        minute,
        type: "kick_off",
        team,
        description: `Kick-off! ${playerName} gets the ball rolling for ${teamName || (team === 'home' ? 'Home Team' : 'Away Team')}.`,
        player: playerName,
        playerId: player?.id,
        teamId: team === 'home' ? options?.homeTeamId : options?.awayTeamId,
        teamName,
        teamLogo
      };
    }
  }
};

/**
 * Get a random event generator based on game state and field position
 */
export function getRandomEventGenerator(state: GameState, fieldPosition: FieldPosition): EventGenerator {
  let possibleEvents: string[] = [];
  
  // Define possible events based on the current game state
  switch (state) {
    case 'buildup':
      possibleEvents = ['pass', 'dribble', 'tackle', 'outOfField'];
      break;
    case 'attacking':
      possibleEvents = ['pass', 'dribble', 'shot', 'corner', 'foul'];
      break;
    case 'dangerousAttack':
      possibleEvents = ['shot', 'goal', 'corner', 'foul', 'tackle', 'yellow_card'];
      break;
    case 'defending':
      possibleEvents = ['tackle', 'foul', 'yellow_card', 'outOfField'];
      break;
    case 'counterAttack':
      possibleEvents = ['pass', 'dribble', 'shot', 'goal', 'tackle'];
      break;
    case 'setpiece':
      possibleEvents = ['shot', 'goal', 'corner', 'pass', 'foul'];
      break;
    default:
      possibleEvents = ['pass', 'commentary', 'buildup'];
  }
  
  // Get a random event from the possible events
  const eventType = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
  
  return eventGenerators[eventType] || eventGenerators.commentary;
}

/**
 * Generate state event
 */
export function generateStateEvent(
  minute: number,
  state: GameState,
  possession: 'home' | 'away',
  options?: MatchEventGeneratorOptions
): MatchEventData {
  const teamName = possession === 'home' ? options?.homeTeamName : options?.awayTeamName;
  const teamLogo = possession === 'home' ? options?.homeTeamLogo : options?.awayTeamLogo;
  
  return {
    minute,
    type: "commentary",
    team: possession,
    description: generateStateCommentary(state, possession, teamName),
    teamName,
    teamLogo
  };
}
