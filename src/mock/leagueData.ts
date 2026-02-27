
/**
 * Centralized mock league and team data for use across League and LeagueTeams pages.
 */

// League Standings for League.tsx
export const leagueStandings = [
  { position: 1, team: "Atlas FC", played: 14, won: 10, drawn: 3, lost: 1, goalsFor: 28, goalsAgainst: 10, points: 33, form: ["W", "W", "D", "W", "W"] },
  { position: 2, team: "Golden Stars", played: 14, won: 9, drawn: 3, lost: 2, goalsFor: 25, goalsAgainst: 12, points: 30, form: ["W", "D", "W", "L", "W"] },
  { position: 3, team: "Gridiron Rivals", played: 14, won: 9, drawn: 2, lost: 3, goalsFor: 26, goalsAgainst: 15, points: 29, form: ["W", "W", "L", "W", "W"] },
  { position: 4, team: "Lions FC", played: 14, won: 8, drawn: 3, lost: 3, goalsFor: 22, goalsAgainst: 15, points: 27, form: ["W", "D", "W", "W", "L"] },
  { position: 5, team: "City Stars", played: 14, won: 7, drawn: 5, lost: 2, goalsFor: 19, goalsAgainst: 14, points: 26, form: ["D", "D", "W", "W", "W"] },
  { position: 6, team: "Athletic FC", played: 14, won: 7, drawn: 3, lost: 4, goalsFor: 20, goalsAgainst: 16, points: 24, form: ["L", "W", "D", "W", "W"] },
  { position: 7, team: "United FC", played: 14, won: 6, drawn: 4, lost: 4, goalsFor: 18, goalsAgainst: 17, points: 22, form: ["W", "D", "W", "L", "D"] },
  { position: 8, team: "Tigers United", played: 14, won: 5, drawn: 5, lost: 4, goalsFor: 15, goalsAgainst: 14, points: 20, form: ["D", "W", "D", "D", "L"] },
  { position: 9, team: "Royal Knights", played: 14, won: 5, drawn: 4, lost: 5, goalsFor: 17, goalsAgainst: 18, points: 19, form: ["W", "L", "W", "L", "D"] },
  { position: 10, team: "Eagles United", played: 14, won: 4, drawn: 6, lost: 4, goalsFor: 14, goalsAgainst: 14, points: 18, form: ["D", "D", "D", "W", "W"] },
  { position: 11, team: "Valley FC", played: 14, won: 4, drawn: 5, lost: 5, goalsFor: 13, goalsAgainst: 16, points: 17, form: ["D", "L", "D", "W", "L"] },
  { position: 12, team: "Metro Warriors", played: 14, won: 3, drawn: 6, lost: 5, goalsFor: 13, goalsAgainst: 17, points: 15, form: ["D", "D", "L", "D", "L"] },
  { position: 13, team: "Phoenix Rising", played: 14, won: 3, drawn: 5, lost: 6, goalsFor: 12, goalsAgainst: 19, points: 14, form: ["L", "D", "W", "L", "D"] },
  { position: 14, team: "Crystal FC", played: 14, won: 3, drawn: 4, lost: 7, goalsFor: 11, goalsAgainst: 20, points: 13, form: ["L", "L", "W", "D", "L"] },
  { position: 15, team: "Riverside United", played: 14, won: 2, drawn: 5, lost: 7, goalsFor: 10, goalsAgainst: 22, points: 11, form: ["D", "L", "L", "D", "L"] },
  { position: 16, team: "Seaside Rovers", played: 14, won: 1, drawn: 3, lost: 10, goalsFor: 8, goalsAgainst: 26, points: 6, form: ["L", "L", "L", "L", "D"] },
];

// Top Scorers for League.tsx
export const topScorers = [
  { position: 1, player: "Marcus Johnson", team: "Atlas FC", goals: 12, assists: 5 },
  { position: 2, player: "Carlos Mendez", team: "Gridiron Rivals", goals: 11, assists: 7 },
  { position: 3, player: "David Smith", team: "Lions FC", goals: 10, assists: 3 },
  { position: 4, player: "Juan Rodriguez", team: "Golden Stars", goals: 9, assists: 8 },
  { position: 5, player: "Alex Brown", team: "City Stars", goals: 9, assists: 2 },
  { position: 6, player: "Takashi Nakamura", team: "Gridiron Rivals", goals: 8, assists: 10 },
  { position: 7, player: "Ibrahim Diallo", team: "Athletic FC", goals: 8, assists: 4 },
  { position: 8, player: "Lukas Müller", team: "United FC", goals: 7, assists: 6 },
  { position: 9, player: "James Wilson", team: "Tigers United", goals: 7, assists: 5 },
  { position: 10, player: "Pavel Kowalski", team: "Royal Knights", goals: 7, assists: 4 },
];

// League Teams for LeagueTeams.tsx
export const leagueTeams = [
  {
    id: 1,
    name: "FC Barcelona",
    shortName: "BAR",
    logo: "B",
    primaryColor: "#A50044",
    position: 1,
    played: 8,
    won: 7,
    drawn: 0,
    lost: 1,
    goalsFor: 22,
    goalsAgainst: 8,
    points: 21,
    form: ["W", "W", "W", "L", "W"]
  },
  {
    id: 2,
    name: "Real Madrid",
    shortName: "RMA",
    logo: "RM",
    primaryColor: "#FFFFFF",
    position: 2,
    played: 8,
    won: 6,
    drawn: 1,
    lost: 1,
    goalsFor: 18,
    goalsAgainst: 5,
    points: 19,
    form: ["W", "W", "D", "W", "W"]
  },
  {
    id: 3,
    name: "Super Football",
    shortName: "SF",
    logo: "SF",
    primaryColor: "#047857",
    position: 3,
    played: 8,
    won: 5,
    drawn: 2,
    lost: 1,
    goalsFor: 14,
    goalsAgainst: 7,
    points: 17,
    form: ["W", "D", "W", "W", "D"]
  },
  {
    id: 4,
    name: "Atletico Madrid",
    shortName: "ATM",
    logo: "AM",
    primaryColor: "#CB3524",
    position: 4,
    played: 8,
    won: 5,
    drawn: 1,
    lost: 2,
    goalsFor: 12,
    goalsAgainst: 6,
    points: 16,
    form: ["L", "W", "W", "W", "D"]
  },
  {
    id: 5,
    name: "Sevilla FC",
    shortName: "SEV",
    logo: "S",
    primaryColor: "#F43333",
    position: 5,
    played: 8,
    won: 4,
    drawn: 2,
    lost: 2,
    goalsFor: 10,
    goalsAgainst: 8,
    points: 14,
    form: ["W", "D", "W", "L", "D"]
  },
  {
    id: 6,
    name: "Valencia CF",
    shortName: "VAL",
    logo: "V",
    primaryColor: "#F99C00",
    position: 6,
    played: 8,
    won: 3,
    drawn: 3,
    lost: 2,
    goalsFor: 9,
    goalsAgainst: 9,
    points: 12,
    form: ["D", "W", "D", "W", "D"]
  },
  {
    id: 7,
    name: "Athletic Bilbao",
    shortName: "BIL",
    logo: "AB",
    primaryColor: "#EE2523",
    position: 7,
    played: 8,
    won: 3,
    drawn: 2,
    lost: 3,
    goalsFor: 11,
    goalsAgainst: 10,
    points: 11,
    form: ["L", "W", "D", "L", "W"]
  },
  {
    id: 8,
    name: "Real Sociedad",
    shortName: "RSO",
    logo: "RS",
    primaryColor: "#0B57A4",
    position: 8,
    played: 8,
    won: 3,
    drawn: 2,
    lost: 3,
    goalsFor: 8,
    goalsAgainst: 9,
    points: 11,
    form: ["D", "W", "L", "W", "L"]
  },
];

// Team Players for LeagueTeams.tsx
export const teamPlayers = {
  1: [
    { id: 111, name: "Marc-André ter Stegen", position: "GK", age: 30, nationality: "Germany", rating: 88 },
    { id: 112, name: "Gerard Piqué", position: "CB", age: 35, nationality: "Spain", rating: 84 },
    { id: 113, name: "Sergio Busquets", position: "CDM", age: 33, nationality: "Spain", rating: 86 },
    { id: 114, name: "Frenkie de Jong", position: "CM", age: 25, nationality: "Netherlands", rating: 87 },
    { id: 115, name: "Pedri", position: "CAM", age: 20, nationality: "Spain", rating: 85 },
    { id: 116, name: "Gavi", position: "CM", age: 18, nationality: "Spain", rating: 81 },
    { id: 117, name: "Ansu Fati", position: "LW", age: 20, nationality: "Spain", rating: 83 },
    { id: 118, name: "Robert Lewandowski", position: "ST", age: 34, nationality: "Poland", rating: 91 },
  ],
  2: [
    { id: 211, name: "Thibaut Courtois", position: "GK", age: 30, nationality: "Belgium", rating: 90 },
    { id: 212, name: "David Alaba", position: "CB", age: 30, nationality: "Austria", rating: 86 },
    { id: 213, name: "Luka Modric", position: "CM", age: 37, nationality: "Croatia", rating: 88 },
    { id: 214, name: "Toni Kroos", position: "CM", age: 32, nationality: "Germany", rating: 88 },
    { id: 215, name: "Federico Valverde", position: "CM", age: 24, nationality: "Uruguay", rating: 84 },
    { id: 216, name: "Vinícius Júnior", position: "LW", age: 22, nationality: "Brazil", rating: 86 },
    { id: 217, name: "Karim Benzema", position: "ST", age: 34, nationality: "France", rating: 91 },
    { id: 218, name: "Rodrygo", position: "RW", age: 21, nationality: "Brazil", rating: 83 },
  ],
  4: [
    { id: 411, name: "Jan Oblak", position: "GK", age: 29, nationality: "Slovenia", rating: 89 },
    { id: 412, name: "José Giménez", position: "CB", age: 27, nationality: "Uruguay", rating: 85 },
    { id: 413, name: "Koke", position: "CM", age: 30, nationality: "Spain", rating: 85 },
    { id: 414, name: "Rodrigo De Paul", position: "CM", age: 28, nationality: "Argentina", rating: 84 },
    { id: 415, name: "Marcos Llorente", position: "RM", age: 27, nationality: "Spain", rating: 83 },
    { id: 416, name: "João Félix", position: "CF", age: 22, nationality: "Portugal", rating: 84 },
    { id: 417, name: "Antoine Griezmann", position: "ST", age: 31, nationality: "France", rating: 85 },
    { id: 418, name: "Álvaro Morata", position: "ST", age: 29, nationality: "Spain", rating: 83 },
  ]
};
