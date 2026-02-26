import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, Player } from '../types';

const roundBudget = (value: number) => Math.round(value * 10) / 10;
import { initialPlayers, initialLeagueTable, initialMatches, transferMarketPlayers } from '../data/initialData';

const STORAGE_KEY = 'teamsoccer-manager-state';

const defaultState: GameState = {
  teamName: 'Mi Equipo FC',
  budget: 25.0,
  week: 6,
  players: initialPlayers,
  matches: initialMatches,
  leagueTable: initialLeagueTable,
};

interface GameContextType {
  state: GameState;
  buyPlayer: (player: Player) => void;
  sellPlayer: (playerId: number) => void;
  updatePlayer: (player: Player) => void;
  simulateMatch: () => void;
  resetGame: () => void;
  marketPlayers: Player[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as GameState;
    } catch { /* ignore */ }
    return defaultState;
  });

  const [marketPlayers, setMarketPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '-market');
      if (saved) return JSON.parse(saved) as Player[];
    } catch { /* ignore */ }
    return transferMarketPlayers;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '-market', JSON.stringify(marketPlayers));
  }, [marketPlayers]);

  const buyPlayer = (player: Player) => {
    if (state.budget < player.value) return;
    setState(prev => ({
      ...prev,
      budget: roundBudget(prev.budget - player.value),
      players: [...prev.players, { ...player, inSquad: true }],
    }));
    setMarketPlayers(prev => prev.filter(p => p.id !== player.id));
  };

  const sellPlayer = (playerId: number) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    setState(prev => ({
      ...prev,
      budget: roundBudget(prev.budget + player.value * 0.85),
      players: prev.players.filter(p => p.id !== playerId),
    }));
    setMarketPlayers(prev => [...prev, { ...player, inSquad: false }]);
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p),
    }));
  };

  const simulateMatch = () => {
    const nextMatch = state.matches.find(m => !m.played);
    if (!nextMatch) return;

    const starters = state.players.slice(0, 11);
    const avgOverall = starters.reduce((sum, p) => sum + p.overall, 0) / starters.length;
    const teamStrength = avgOverall / 100;

    const homeBonus = nextMatch.isHome ? 0.1 : 0;
    const winProb = Math.min(0.7, Math.max(0.2, teamStrength + homeBonus - 0.05));

    let homeGoals: number, awayGoals: number;

    if (nextMatch.isHome) {
      homeGoals = Math.floor(Math.random() * 4 * (winProb + 0.1));
      awayGoals = Math.floor(Math.random() * 3 * (1 - winProb + 0.1));
    } else {
      homeGoals = Math.floor(Math.random() * 3 * (1 - winProb + 0.1));
      awayGoals = Math.floor(Math.random() * 4 * (winProb + 0.1));
    }

    const myGoals = nextMatch.isHome ? homeGoals : awayGoals;
    const theirGoals = nextMatch.isHome ? awayGoals : homeGoals;
    const isWin = myGoals > theirGoals;
    const isDraw = myGoals === theirGoals;

    const attackers = starters.filter(p => ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.position));
    const scorerPool = attackers.length > 0 ? attackers : starters;
    const updatedPlayers = [...state.players];
    if (scorerPool.length === 0) return;
    for (let i = 0; i < myGoals; i++) {
      const scorer = scorerPool[Math.floor(Math.random() * scorerPool.length)];
      const idx = updatedPlayers.findIndex(p => p.id === scorer.id);
      if (idx >= 0) updatedPlayers[idx] = { ...updatedPlayers[idx], goals: updatedPlayers[idx].goals + 1 };
      const assistIdx = Math.floor(Math.random() * starters.length);
      const assister = starters[assistIdx];
      const aIdx = updatedPlayers.findIndex(p => p.id === assister.id);
      if (aIdx >= 0 && aIdx !== idx) updatedPlayers[aIdx] = { ...updatedPlayers[aIdx], assists: updatedPlayers[aIdx].assists + 1 };
    }

    const updatedTable = state.leagueTable.map(team => {
      if (team.name === state.teamName) {
        return {
          ...team,
          played: team.played + 1,
          won: team.won + (isWin ? 1 : 0),
          drawn: team.drawn + (isDraw ? 1 : 0),
          lost: team.lost + (!isWin && !isDraw ? 1 : 0),
          gf: team.gf + myGoals,
          ga: team.ga + theirGoals,
          gd: team.gd + myGoals - theirGoals,
          points: team.points + (isWin ? 3 : isDraw ? 1 : 0),
        };
      }
      const oppGoals = Math.floor(Math.random() * 3);
      const oppAgainst = Math.floor(Math.random() * 3);
      const oppWin = oppGoals > oppAgainst;
      const oppDraw = oppGoals === oppAgainst;
      return {
        ...team,
        played: team.played + 1,
        won: team.won + (oppWin ? 1 : 0),
        drawn: team.drawn + (oppDraw ? 1 : 0),
        lost: team.lost + (!oppWin && !oppDraw ? 1 : 0),
        gf: team.gf + oppGoals,
        ga: team.ga + oppAgainst,
        gd: team.gd + oppGoals - oppAgainst,
        points: team.points + (oppWin ? 3 : oppDraw ? 1 : 0),
      };
    }).sort((a, b) => b.points - a.points || b.gd - a.gd);

    setState(prev => ({
      ...prev,
      week: prev.week + 1,
      players: updatedPlayers,
      matches: prev.matches.map(m =>
        m.id === nextMatch.id ? { ...m, homeGoals, awayGoals, played: true } : m
      ),
      leagueTable: updatedTable,
      budget: roundBudget(prev.budget + (isWin ? 0.5 : isDraw ? 0.2 : 0)),
    }));
  };

  const resetGame = () => {
    setState(defaultState);
    setMarketPlayers(transferMarketPlayers);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '-market');
  };

  return (
    <GameContext.Provider value={{ state, buyPlayer, sellPlayer, updatePlayer, simulateMatch, resetGame, marketPlayers }}>
      {children}
    </GameContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
