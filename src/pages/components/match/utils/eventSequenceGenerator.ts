
import { MatchEventData } from '../types/matchTypes';
import { Player } from '../../../components/types/match';

export const generateEventSequence = (homePlayers: Player[], awayPlayers: Player[], teamWithBall: 'home' | 'away'): MatchEventData => {
  const players = teamWithBall === 'home' ? homePlayers : awayPlayers;
  
  // Make sure we have players before selecting one randomly
  if (!players || players.length === 0) {
    return {
      type: "commentary",
      team: teamWithBall,
      minute: 0,
      description: `The ${teamWithBall} team is making a move.`
    };
  }
  
  const randomPlayer = players[Math.floor(Math.random() * players.length)];
  const playerName = randomPlayer ? `${randomPlayer.firstName} ${randomPlayer.lastName}` : "Player";

  const events: { [key: string]: () => MatchEventData } = {
    shot: () => ({
      type: "shot",
      team: teamWithBall,
      minute: 0,
      description: `${playerName} takes a shot but it goes wide!`,
      player: playerName,
      playerId: randomPlayer?.id
    }),
    
    goal: () => ({
      type: "goal",
      team: teamWithBall,
      minute: 0,
      description: `GOAL! ${playerName} scores!`,
      player: playerName,
      playerId: randomPlayer?.id
    }),
    
    save: () => ({
      type: "save",
      team: teamWithBall === 'home' ? 'away' : 'home',
      minute: 0,
      description: `${playerName} makes a great save!`,
      player: playerName,
      playerId: randomPlayer?.id
    }),

    corner: () => ({
      type: "corner",
      team: teamWithBall,
      minute: 0,
      description: `Corner kick taken by ${playerName}`,
      player: playerName,
      playerId: randomPlayer?.id
    })
  };

  const eventTypes = Object.keys(events);
  const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  
  return events[randomEventType]();
};

// Adding new exported functions that are being imported elsewhere

export const generateAttackSequence = (
  minute: number, 
  attackingTeam: 'home' | 'away', 
  homePlayers: Player[], 
  awayPlayers: Player[],
  specificPlayer?: number,
  scoreGoal?: boolean
): MatchEventData[] => {
  const events: MatchEventData[] = [];
  
  // Add commentary event
  events.push({
    minute,
    type: "commentary",
    team: attackingTeam,
    description: `${attackingTeam === 'home' ? 'Home' : 'Away'} team is starting an attack!`
  });
  
  // Add a progression of events
  events.push({
    minute: minute + 1,
    type: scoreGoal ? "goal" : Math.random() > 0.7 ? "shot" : "corner",
    team: attackingTeam,
    description: generateEventSequence(homePlayers, awayPlayers, attackingTeam).description,
    player: generateEventSequence(homePlayers, awayPlayers, attackingTeam).player
  });
  
  return events;
};

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
