
export const generateMockStats = (match: { home_score?: number | null; away_score?: number | null }) => {
  if (!match) return null;
  
  const homeScore = match.home_score || 0;
  const awayScore = match.away_score || 0;
  
  return {
    possession: {
      home: 50 + (homeScore > awayScore ? 10 : homeScore < awayScore ? -10 : 0),
      away: 50 - (homeScore > awayScore ? 10 : homeScore < awayScore ? -10 : 0)
    },
    shots: {
      home: homeScore * 3 + Math.floor(Math.random() * 5),
      away: awayScore * 3 + Math.floor(Math.random() * 5)
    },
    shotsOnTarget: {
      home: homeScore + Math.floor(Math.random() * 3),
      away: awayScore + Math.floor(Math.random() * 3)
    },
    corners: {
      home: Math.floor(Math.random() * 8) + 2,
      away: Math.floor(Math.random() * 8) + 2
    },
    fouls: {
      home: Math.floor(Math.random() * 10) + 5,
      away: Math.floor(Math.random() * 10) + 5
    }
  };
};
