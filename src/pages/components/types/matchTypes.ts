
export interface MatchEventPosition {
  positions: { id: number; x: number; y: number }[];
}

export interface MatchEventData {
  minute: number;
  type: "goal" | "shot" | "save" | "foul" | "card" | "yellow_card" | "red_card" | "corner" | "possession" | "commentary" | "substitution" | "injury" | "out_of_field" | "throw_in" | "kick_off" | "weather";
  team: "home" | "away";
  player?: string;
  playerId?: number;
  description: string;
  positions?: MatchEventPosition;
  homeScore?: number;
  awayScore?: number;
  teamId?: number;
  teamName?: string;
  teamLogo?: string;
  weather?: string;  // Added for weather information
  weatherIcon?: string; // Added for weather icon
}

export interface PitchMarkingsProps {
  homeTeamColor?: string;
  awayTeamColor?: string;
}

export interface MatchTabsProps {
  match: any;
  matchStats: any;
  highlights: any;
  isCompleted: boolean;
  isUpcoming: boolean;
}
