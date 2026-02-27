
import { MatchEventData } from "../../types/matchTypes";
import { Player } from "../../../../components/types/match";
import { MatchEventGeneratorOptions } from "../types/engineTypes";

/**
 * Generate initial match event
 */
export function generateInitialEvent(
  homePlayers: Player[], 
  awayPlayers: Player[],
  options?: MatchEventGeneratorOptions
): MatchEventData {
  // Generate kick-off event for home team at the start
  return {
    minute: 0,
    type: "kick_off",
    team: "home",
    description: "The match begins with a kick-off from the home team!",
    positions: {
      positions: [
        ...homePlayers.map(p => ({ id: p.id, x: p.x, y: p.y })),
        ...awayPlayers.map(p => ({ id: p.id, x: p.x, y: p.y }))
      ]
    },
    teamName: options?.homeTeamName,
    teamLogo: options?.homeTeamLogo
  };
}

/**
 * Generate half time event
 */
export function generateHalfTimeEvent(options?: MatchEventGeneratorOptions): MatchEventData {
  return {
    minute: 45,
    type: "commentary",
    team: "home",
    description: "The referee blows the whistle for half time.",
    teamName: options?.homeTeamName,
    teamLogo: options?.homeTeamLogo
  };
}

/**
 * Generate second half start event
 */
export function generateSecondHalfEvent(
  homePlayers: Player[], 
  awayPlayers: Player[],
  options?: MatchEventGeneratorOptions
): MatchEventData {
  // Generate kick-off event for away team at the start of second half
  return {
    minute: 46,
    type: "kick_off",
    team: "away",
    description: "The second half begins with a kick-off from the away team!",
    positions: {
      positions: [
        ...homePlayers.map(p => ({ id: p.id, x: p.x, y: p.y })),
        ...awayPlayers.map(p => ({ id: p.id, x: p.x, y: p.y }))
      ]
    },
    teamName: options?.awayTeamName,
    teamLogo: options?.awayTeamLogo
  };
}

/**
 * Generate full time event
 */
export function generateFullTimeEvent(options?: MatchEventGeneratorOptions): MatchEventData {
  return {
    minute: 90,
    type: "commentary",
    team: "home",
    description: "The referee blows the whistle for full time.",
    teamName: options?.homeTeamName,
    teamLogo: options?.homeTeamLogo
  };
}

/**
 * Generate attack sequences for simulation
 */
export const generateAttackSequence = (
  minute: number, 
  attackingTeam: 'home' | 'away', 
  homePlayers: Player[], 
  awayPlayers: Player[],
  specificPlayer?: number,
  scoreGoal?: boolean
): MatchEventData[] => {
  const events: MatchEventData[] = [];
  const players = attackingTeam === 'home' ? homePlayers : awayPlayers;
  
  if (!players || players.length === 0) {
    events.push({
      minute,
      type: "commentary",
      team: attackingTeam,
      description: `${attackingTeam === 'home' ? 'Home' : 'Away'} team is starting an attack!`
    });
    return events;
  }
  
  // Find specific player or get random player
  let player: Player | undefined;
  if (specificPlayer) {
    player = players.find(p => p.id === specificPlayer);
  }
  
  if (!player) {
    player = players[Math.floor(Math.random() * players.length)];
  }
  
  const playerName = player ? `${player.firstName} ${player.lastName}` : "Player";
  
  // Add commentary event
  events.push({
    minute,
    type: "commentary",
    team: attackingTeam,
    description: `${attackingTeam === 'home' ? 'Home' : 'Away'} team is starting an attack!`,
    player: playerName,
    playerId: player?.id
  });
  
  // Add a progression of events
  const eventType = scoreGoal ? "goal" : Math.random() > 0.7 ? "shot" : "corner";
  
  events.push({
    minute: minute + 1,
    type: eventType,
    team: attackingTeam,
    description: eventType === 'goal' ? 
      `GOAL! ${playerName} scores!` : 
      eventType === 'shot' ? 
      `${playerName} takes a shot but it goes wide!` :
      `Corner kick taken by ${playerName}`,
    player: playerName,
    playerId: player?.id
  });
  
  return events;
};

/**
 * Generate injury event
 */
export const generateInjuryEvent = (
  minute: number,
  team: 'home' | 'away',
  homePlayers: Player[],
  awayPlayers: Player[]
): MatchEventData => {
  const players = team === 'home' ? homePlayers : awayPlayers;
  
  if (!players || players.length === 0) {
    return {
      minute,
      type: "injury",
      team,
      description: `A player from the ${team} team appears to be injured.`
    };
  }
  
  const randomPlayer = players[Math.floor(Math.random() * players.length)];
  const playerName = randomPlayer ? `${randomPlayer.firstName} ${randomPlayer.lastName}` : "Player";
  
  return {
    minute,
    type: "injury",
    team,
    player: playerName,
    playerId: randomPlayer?.id,
    description: `${playerName} is down injured. Medical staff are attending.`
  };
};
