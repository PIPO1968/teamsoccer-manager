export const formations = [
  { id: "5-5-0", name: "5-5-0" },
  { id: "5-4-1", name: "5-4-1" },
  { id: "5-3-2", name: "5-3-2" },
  { id: "5-2-3", name: "5-2-3" },
  { id: "4-5-1", name: "4-5-1" },
  { id: "4-4-2", name: "4-4-2" },
  { id: "4-3-3", name: "4-3-3" },
  { id: "3-5-2", name: "3-5-2" },
  { id: "3-4-3", name: "3-4-3" },
  { id: "2-5-3", name: "2-5-3" }
];

export const tactics = [
  { id: "normal", name: "Normal" },
  { id: "attacking", name: "Attacking" },
  { id: "defensive", name: "Defensive" },
  { id: "possession", name: "Possession" },
  { id: "counter", name: "Counter-Attack" }
];

export const attitudes = [
  { id: "normal", name: "Normal" },
  { id: "cautious", name: "Cautious" },
  { id: "aggressive", name: "Aggressive" }
];

export const positionRoles = {
  GK: ["Goalkeeper"],
  CB: ["Defender", "Ball Playing Defender", "Stopper"],
  LB: ["Fullback", "Wing Back", "Defensive Fullback"],
  RB: ["Fullback", "Wing Back", "Defensive Fullback"],
  LWB: ["Wing Back", "Attacking Wing Back", "Defensive Wing Back"],
  RWB: ["Wing Back", "Attacking Wing Back", "Defensive Wing Back"],
  CDM: ["Defensive Midfielder", "Anchor", "Ball Winner"],
  CM: ["Central Midfielder", "Box-to-Box", "Playmaker"],
  CAM: ["Attacking Midfielder", "Advanced Playmaker", "Shadow Striker"],
  LM: ["Midfielder", "Wide Midfielder", "Wide Playmaker"],
  RM: ["Midfielder", "Wide Midfielder", "Wide Playmaker"],
  LW: ["Winger", "Inside Forward", "Inverted Winger"],
  RW: ["Winger", "Inside Forward", "Inverted Winger"],
  ST: ["Striker", "Target Man", "Poacher", "Complete Forward"]
};

export const getPlayerRoles = (position: string): string[] => {
  return positionRoles[position as keyof typeof positionRoles] || ["Unknown"];
};

export const getPositionColor = (position: string): string => {
  if (position === 'GK') return 'bg-orange-500';
  if (['CB', 'LB', 'RB', 'RWB', 'LWB'].includes(position)) return 'bg-blue-500';
  if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(position)) return 'bg-green-500';
  return 'bg-red-500';
};
