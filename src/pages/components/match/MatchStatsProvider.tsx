
import React, { createContext, useContext, useState } from 'react';
import { MatchEventData } from './types/matchTypes';

interface MatchStatsContextType {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  matchEvents: MatchEventData[];
  updateStats: (type: string, team: 'home' | 'away') => void;
  setMatchEvents: React.Dispatch<React.SetStateAction<MatchEventData[]>>;
}

const MatchStatsContext = createContext<MatchStatsContextType | undefined>(undefined);

export const useMatchStats = () => {
  const context = useContext(MatchStatsContext);
  if (!context) {
    throw new Error('useMatchStats must be used within a MatchStatsProvider');
  }
  return context;
};

export const MatchStatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [possession, setPossession] = useState({ home: 55, away: 45 });
  const [shots, setShots] = useState({ home: 0, away: 0 });
  const [shotsOnTarget, setShotsOnTarget] = useState({ home: 0, away: 0 });
  const [corners, setCorners] = useState({ home: 0, away: 0 });
  const [fouls, setFouls] = useState({ home: 0, away: 0 });
  const [yellowCards, setYellowCards] = useState({ home: 0, away: 0 });
  const [redCards, setRedCards] = useState({ home: 0, away: 0 });
  const [matchEvents, setMatchEvents] = useState<MatchEventData[]>([]);

  const updateStats = (type: string, team: 'home' | 'away') => {
    switch (type) {
      case 'shot':
        setShots(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
      case 'goal':
        setShots(prev => ({ ...prev, [team]: prev[team] + 1 }));
        setShotsOnTarget(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
      case 'corner':
        setCorners(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
      case 'foul':
        setFouls(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
      case 'yellow_card':
        setYellowCards(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
      case 'red_card':
        setRedCards(prev => ({ ...prev, [team]: prev[team] + 1 }));
        break;
    }
  };

  return (
    <MatchStatsContext.Provider 
      value={{ 
        possession, 
        shots, 
        shotsOnTarget, 
        corners, 
        fouls, 
        yellowCards, 
        redCards, 
        matchEvents, 
        updateStats,
        setMatchEvents 
      }}
    >
      {children}
    </MatchStatsContext.Provider>
  );
};
