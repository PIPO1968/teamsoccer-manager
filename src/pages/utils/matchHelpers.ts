/**
 * Format match time into a readable format
 * @param time Match time in minutes
 * @returns Formatted time string
 */
export const formatMatchTime = (time: number): string => {
  const minutes = Math.floor(time);
  const seconds = Math.floor((time - minutes) * 60);
  
  // For full time
  if (minutes >= 90) {
    return "FT";
  }
  
  // For half time
  if (minutes === 45) {
    return "HT";
  }
  
  // Regular time
  return `${minutes}′${seconds < 10 ? '0' : ''}${seconds}″`;
};

/**
 * Format match date for display
 * @param date Date string
 * @returns Formatted date
 */
export const formatMatchDate = (date: string): string => {
  const matchDate = new Date(date);
  return matchDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const getInitialXYForPos = (pos: string, team: "home" | "away") => {
  const spots = {
    // For horizontal field layout (left-right), home team on left side (0-50), away team on right side (50-100)
    GK: { x: team === "home" ? 10 : 90, y: 50 },
    LB: { x: team === "home" ? 20 : 80, y: 20 },
    CB: { x: team === "home" ? 20 : 80, y: 50 },
    RB: { x: team === "home" ? 20 : 80, y: 80 },
    CDM: { x: team === "home" ? 30 : 70, y: 50 },
    CM: { x: team === "home" ? 30 : 70, y: 30 },
    CAM: { x: team === "home" ? 40 : 60, y: 50 },
    LW: { x: team === "home" ? 40 : 60, y: 20 },
    ST: { x: team === "home" ? 40 : 60, y: 50 },
    RW: { x: team === "home" ? 40 : 60, y: 80 }
  };
  return spots[pos as keyof typeof spots] || { x: 50, y: 50 };
};
