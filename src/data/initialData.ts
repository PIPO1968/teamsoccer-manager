import { Player, Match, TeamStats, Formation } from '../types';

export const formations: Formation[] = [
  {
    name: '4-4-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 },
      { position: 'CB', x: 35, y: 70 },
      { position: 'CB', x: 65, y: 70 },
      { position: 'RB', x: 85, y: 70 },
      { position: 'LW', x: 15, y: 50 },
      { position: 'CM', x: 35, y: 50 },
      { position: 'CM', x: 65, y: 50 },
      { position: 'RW', x: 85, y: 50 },
      { position: 'ST', x: 35, y: 20 },
      { position: 'ST', x: 65, y: 20 },
    ],
  },
  {
    name: '4-3-3',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 70 },
      { position: 'CB', x: 35, y: 70 },
      { position: 'CB', x: 65, y: 70 },
      { position: 'RB', x: 85, y: 70 },
      { position: 'CDM', x: 50, y: 55 },
      { position: 'CM', x: 25, y: 45 },
      { position: 'CM', x: 75, y: 45 },
      { position: 'LW', x: 15, y: 20 },
      { position: 'ST', x: 50, y: 15 },
      { position: 'RW', x: 85, y: 20 },
    ],
  },
  {
    name: '3-5-2',
    positions: [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 72 },
      { position: 'CB', x: 50, y: 72 },
      { position: 'CB', x: 75, y: 72 },
      { position: 'LB', x: 10, y: 50 },
      { position: 'CDM', x: 30, y: 50 },
      { position: 'CM', x: 50, y: 45 },
      { position: 'CAM', x: 70, y: 50 },
      { position: 'RB', x: 90, y: 50 },
      { position: 'ST', x: 35, y: 20 },
      { position: 'ST', x: 65, y: 20 },
    ],
  },
];

export const initialPlayers: Player[] = [
  { id: 1, name: 'Carlos Ruiz', position: 'GK', age: 28, overall: 78, speed: 55, shooting: 30, passing: 65, defending: 80, energy: 100, salary: 25, value: 3.5, goals: 0, assists: 0, inSquad: true },
  { id: 2, name: 'Marco Fernández', position: 'CB', age: 26, overall: 75, speed: 65, shooting: 45, passing: 68, defending: 82, energy: 100, salary: 22, value: 4.0, goals: 1, assists: 0, inSquad: true },
  { id: 3, name: 'Luis García', position: 'CB', age: 30, overall: 77, speed: 60, shooting: 40, passing: 70, defending: 85, energy: 100, salary: 24, value: 3.0, goals: 2, assists: 1, inSquad: true },
  { id: 4, name: 'Pablo Torres', position: 'LB', age: 24, overall: 73, speed: 78, shooting: 55, passing: 72, defending: 74, energy: 100, salary: 20, value: 5.0, goals: 0, assists: 3, inSquad: true },
  { id: 5, name: 'Diego Herrera', position: 'RB', age: 25, overall: 74, speed: 80, shooting: 58, passing: 70, defending: 75, energy: 100, salary: 21, value: 4.5, goals: 1, assists: 2, inSquad: true },
  { id: 6, name: 'Raúl Mendoza', position: 'CDM', age: 27, overall: 76, speed: 68, shooting: 60, passing: 75, defending: 78, energy: 100, salary: 23, value: 6.0, goals: 2, assists: 4, inSquad: true },
  { id: 7, name: 'Sergio Vega', position: 'CM', age: 23, overall: 74, speed: 72, shooting: 65, passing: 80, defending: 60, energy: 100, salary: 20, value: 7.0, goals: 3, assists: 6, inSquad: true },
  { id: 8, name: 'Andrés Mora', position: 'CM', age: 29, overall: 78, speed: 70, shooting: 68, passing: 82, defending: 65, energy: 100, salary: 26, value: 5.5, goals: 4, assists: 8, inSquad: true },
  { id: 9, name: 'Javier Ramos', position: 'LW', age: 22, overall: 75, speed: 88, shooting: 72, passing: 74, defending: 45, energy: 100, salary: 22, value: 9.0, goals: 7, assists: 5, inSquad: true },
  { id: 10, name: 'Carlos Silva', position: 'RW', age: 24, overall: 76, speed: 85, shooting: 74, passing: 72, defending: 42, energy: 100, salary: 23, value: 8.5, goals: 9, assists: 4, inSquad: true },
  { id: 11, name: 'Miguel Ángel', position: 'ST', age: 26, overall: 82, speed: 82, shooting: 88, passing: 68, defending: 38, energy: 100, salary: 35, value: 15.0, goals: 14, assists: 3, inSquad: true },
  { id: 12, name: 'Eduardo Soto', position: 'GK', age: 22, overall: 68, speed: 52, shooting: 28, passing: 60, defending: 72, energy: 100, salary: 12, value: 1.5, goals: 0, assists: 0, inSquad: true },
  { id: 13, name: 'Fernando López', position: 'CB', age: 21, overall: 65, speed: 62, shooting: 42, passing: 65, defending: 70, energy: 100, salary: 10, value: 2.0, goals: 0, assists: 0, inSquad: true },
  { id: 14, name: 'Roberto Díaz', position: 'CM', age: 20, overall: 66, speed: 70, shooting: 62, passing: 76, defending: 55, energy: 100, salary: 11, value: 3.5, goals: 1, assists: 2, inSquad: true },
  { id: 15, name: 'Alejandro Vidal', position: 'ST', age: 19, overall: 68, speed: 80, shooting: 75, passing: 60, defending: 30, energy: 100, salary: 13, value: 5.0, goals: 3, assists: 1, inSquad: true },
];

export const transferMarketPlayers: Player[] = [
  { id: 101, name: 'Antoine Dubois', position: 'GK', age: 25, overall: 82, speed: 58, shooting: 32, passing: 70, defending: 86, energy: 100, salary: 35, value: 8.0, goals: 0, assists: 0, inSquad: false },
  { id: 102, name: 'Stefan Müller', position: 'CB', age: 28, overall: 84, speed: 68, shooting: 48, passing: 74, defending: 88, energy: 100, salary: 38, value: 12.0, goals: 2, assists: 1, inSquad: false },
  { id: 103, name: 'James Wilson', position: 'LB', age: 23, overall: 79, speed: 82, shooting: 60, passing: 76, defending: 80, energy: 100, salary: 28, value: 9.0, goals: 1, assists: 5, inSquad: false },
  { id: 104, name: 'Pierre Leblanc', position: 'CDM', age: 26, overall: 81, speed: 72, shooting: 65, passing: 80, defending: 82, energy: 100, salary: 32, value: 11.0, goals: 3, assists: 6, inSquad: false },
  { id: 105, name: 'Luca Romano', position: 'CAM', age: 24, overall: 83, speed: 78, shooting: 76, passing: 88, defending: 52, energy: 100, salary: 36, value: 14.0, goals: 8, assists: 12, inSquad: false },
  { id: 106, name: 'Marcos Oliveira', position: 'LW', age: 22, overall: 80, speed: 90, shooting: 78, passing: 75, defending: 48, energy: 100, salary: 30, value: 13.0, goals: 11, assists: 7, inSquad: false },
  { id: 107, name: 'Hiroshi Tanaka', position: 'RW', age: 25, overall: 81, speed: 87, shooting: 80, passing: 76, defending: 45, energy: 100, salary: 32, value: 12.5, goals: 13, assists: 6, inSquad: false },
  { id: 108, name: 'Ivan Petrov', position: 'ST', age: 27, overall: 86, speed: 84, shooting: 90, passing: 70, defending: 40, energy: 100, salary: 45, value: 22.0, goals: 18, assists: 4, inSquad: false },
  { id: 109, name: "Kevin O'Brien", position: 'CM', age: 26, overall: 80, speed: 74, shooting: 70, passing: 84, defending: 68, energy: 100, salary: 30, value: 10.0, goals: 5, assists: 9, inSquad: false },
  { id: 110, name: 'Takeshi Yamamoto', position: 'ST', age: 21, overall: 77, speed: 86, shooting: 82, passing: 68, defending: 35, energy: 100, salary: 25, value: 16.0, goals: 10, assists: 3, inSquad: false },
];

export const initialLeagueTable: TeamStats[] = [
  { name: 'Atlético Madrid', played: 5, won: 4, drawn: 1, lost: 0, gf: 12, ga: 4, gd: 8, points: 13 },
  { name: 'Mi Equipo FC', played: 5, won: 3, drawn: 1, lost: 1, gf: 9, ga: 5, gd: 4, points: 10 },
  { name: 'Sevilla CF', played: 5, won: 3, drawn: 0, lost: 2, gf: 8, ga: 7, gd: 1, points: 9 },
  { name: 'Valencia CF', played: 5, won: 2, drawn: 2, lost: 1, gf: 7, ga: 6, gd: 1, points: 8 },
  { name: 'Real Sociedad', played: 5, won: 2, drawn: 1, lost: 2, gf: 6, ga: 7, gd: -1, points: 7 },
  { name: 'Villarreal CF', played: 5, won: 2, drawn: 1, lost: 2, gf: 5, ga: 6, gd: -1, points: 7 },
  { name: 'Athletic Club', played: 5, won: 1, drawn: 2, lost: 2, gf: 5, ga: 8, gd: -3, points: 5 },
  { name: 'RC Celta', played: 5, won: 1, drawn: 1, lost: 3, gf: 4, ga: 9, gd: -5, points: 4 },
  { name: 'RCD Mallorca', played: 5, won: 1, drawn: 0, lost: 4, gf: 3, ga: 10, gd: -7, points: 3 },
  { name: 'Cádiz CF', played: 5, won: 0, drawn: 1, lost: 4, gf: 2, ga: 10, gd: -8, points: 1 },
];

export const initialMatches: Match[] = [
  { id: 1, opponent: 'Atlético Madrid', homeGoals: 2, awayGoals: 1, isHome: true, date: 'Semana 1', played: true },
  { id: 2, opponent: 'Sevilla CF', homeGoals: 0, awayGoals: 0, isHome: false, date: 'Semana 2', played: true },
  { id: 3, opponent: 'Valencia CF', homeGoals: 3, awayGoals: 1, isHome: true, date: 'Semana 3', played: true },
  { id: 4, opponent: 'Real Sociedad', homeGoals: 1, awayGoals: 2, isHome: false, date: 'Semana 4', played: true },
  { id: 5, opponent: 'Villarreal CF', homeGoals: 2, awayGoals: 2, isHome: true, date: 'Semana 5', played: true },
  { id: 6, opponent: 'Athletic Club', homeGoals: 0, awayGoals: 0, isHome: false, date: 'Semana 6', played: false },
  { id: 7, opponent: 'RC Celta', homeGoals: 0, awayGoals: 0, isHome: true, date: 'Semana 7', played: false },
  { id: 8, opponent: 'RCD Mallorca', homeGoals: 0, awayGoals: 0, isHome: false, date: 'Semana 8', played: false },
  { id: 9, opponent: 'Cádiz CF', homeGoals: 0, awayGoals: 0, isHome: true, date: 'Semana 9', played: false },
  { id: 10, opponent: 'Atlético Madrid', homeGoals: 0, awayGoals: 0, isHome: false, date: 'Semana 10', played: false },
];
