
import { GameState } from "../types/engineTypes";

/**
 * Generate description for a specific event type
 */
export function generateEventDescription(
  eventType: string, 
  playerName: string, 
  team: "home" | "away",
  teamName?: string
): string {
  const teamDisplay = teamName || (team === "home" ? "Home Team" : "Away Team");
  
  const descriptions: Record<string, string[]> = {
    goal: [
      `GOAL! ${playerName} scores for ${teamDisplay}!`,
      `What a finish by ${playerName}! ${teamDisplay} scores!`,
      `${playerName} finds the back of the net for ${teamDisplay}!`
    ],
    shot: [
      `${playerName} takes a shot on goal!`,
      `${playerName} tries his luck from distance!`,
      `A strike from ${playerName} for ${teamDisplay}!`
    ],
    save: [
      `Great save by ${playerName}!`,
      `${playerName} makes an excellent stop!`,
      `${playerName} denies the opposition with a brilliant save!`
    ],
    pass: [
      `${playerName} with a nice pass forward.`,
      `${playerName} distributes the ball.`,
      `${playerName} finds a teammate with a good pass.`
    ],
    dribble: [
      `${playerName} dribbles past a defender!`,
      `Skillful play by ${playerName}!`,
      `${playerName} shows some fancy footwork!`
    ],
    tackle: [
      `Strong tackle by ${playerName}!`,
      `${playerName} wins back possession.`,
      `Good defensive work from ${playerName}.`
    ],
    corner: [
      `Corner kick for ${teamDisplay}, to be taken by ${playerName}.`,
      `${teamDisplay} wins a corner. ${playerName} will take it.`,
      `${playerName} prepares to take the corner for ${teamDisplay}.`
    ],
    foul: [
      `Foul by ${playerName}! Free kick to the opposition.`,
      `The referee calls a foul on ${playerName}.`,
      `${playerName} commits a foul. Free kick awarded.`
    ],
    yellowCard: [
      `Yellow card shown to ${playerName}!`,
      `${playerName} receives a booking from the referee.`,
      `Caution for ${playerName}. Yellow card.`
    ],
    redCard: [
      `RED CARD! ${playerName} is sent off!`,
      `${playerName} is shown a straight red card!`,
      `The referee shows ${playerName} a red card. ${teamDisplay} down to 10 men!`
    ],
    injury: [
      `${playerName} is down injured. The medical team is coming on.`,
      `Concern for ${teamDisplay} as ${playerName} needs treatment.`,
      `Play stops as ${playerName} requires medical attention.`
    ],
    outOfField: [
      `The ball goes out of play off ${playerName}.`,
      `${playerName} puts the ball out of play.`,
      `Ball out of play. Last touched by ${playerName}.`
    ],
    throwIn: [
      `Throw-in for ${teamDisplay}, taken by ${playerName}.`,
      `${playerName} takes the throw-in quickly.`,
      `${teamDisplay} with a throw-in, taken by ${playerName}.`
    ],
    buildup: [
      `${teamDisplay} building an attack through ${playerName}.`,
      `${playerName} helps ${teamDisplay} move forward.`,
      `${playerName} involved as ${teamDisplay} build momentum.`
    ],
    counterAttack: [
      `Quick counter attack led by ${playerName}!`,
      `${teamDisplay} on the counter with ${playerName}!`,
      `Dangerous counter attack from ${teamDisplay}, ${playerName} leading the charge!`
    ]
  };
  
  const options = descriptions[eventType] || [`${playerName} is involved in the action.`];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate a commentary description based on the current game state
 */
export function generateStateCommentary(
  state: GameState, 
  possession: 'home' | 'away',
  teamName?: string
): string {
  const team = teamName || (possession === 'home' ? 'Home Team' : 'Away Team');
  
  const stateCommentary: Record<GameState, string[]> = {
    'kickoff': [
      `The referee blows the whistle and the match is underway!`,
      `${team} gets us started!`,
      `We're off and running!`
    ],
    'buildup': [
      `${team} patiently building from the back.`,
      `${team} controlling possession and looking to move forward.`,
      `${team} keeping the ball as they look for an opening.`
    ],
    'attacking': [
      `${team} on the attack!`,
      `Good forward movement from ${team}.`,
      `${team} pushing forward now.`
    ],
    'defending': [
      `${team} defensively organized.`,
      `${team} getting players behind the ball.`,
      `Good defensive shape from ${team}.`
    ],
    'dangerousAttack': [
      `Dangerous attack from ${team}!`,
      `${team} pressing forward dangerously!`,
      `Great opportunity developing for ${team}!`
    ],
    'counterAttack': [
      `Quick counter attack from ${team}!`,
      `${team} breaking forward at pace!`,
      `Rapid transition by ${team}!`
    ],
    'setpiece': [
      `${team} with a set piece opportunity.`,
      `Free kick for ${team} in a promising position.`,
      `${team} preparing to take the set piece.`
    ],
    'goalKick': [
      `Goal kick for ${team}.`,
      `The keeper prepares to take the goal kick for ${team}.`,
      `${team} to restart play with a goal kick.`
    ],
    'stoppage': [
      `Play temporarily stopped.`,
      `Brief pause in the action.`,
      `The referee halts play momentarily.`
    ],
    'corner': [
      `Corner kick for ${team}.`,
      `${team} wins a corner.`,
      `${team} with a chance from the corner.`
    ],
    'throwIn': [
      `Throw-in for ${team}.`,
      `${team} to restart play with a throw.`,
      `${team} with possession from the throw-in.`
    ]
  };
  
  const options = stateCommentary[state] || [`${team} in possession.`];
  return options[Math.floor(Math.random() * options.length)];
}
