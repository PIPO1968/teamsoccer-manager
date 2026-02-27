
import { Player } from '../../types/match';

export const convertToPlayerData = (player: Player) => ({
  player_id: player.id,
  first_name: player.name.split(' ')[0] || '',
  last_name: player.name.split(' ').slice(1).join(' ') || '',
  position: player.position,
  age: 25,
  nationality_id: 1,
  nationality: 'Unknown',
  value: 1000000,
  wage: 10000,
  fitness: player.energy,
  form: player.form,
  contract_until: '2025-12-31',
  finishing: 70,
  pace: 70,
  passing: 70,
  defense: 70,
  dribbling: 70,
  heading: 70,
  stamina: player.energy,
  team_id: 1,
  goals: 0,
  assists: 0,
  matches_played: 0,
  minutes_played: 0,
  rating: 7.0,
  personality: 70,
  experience: 70,
  leadership: 70,
  loyalty: 70,
  owned_since: '2024-01-01',
  avatar_seed: player.name,
  avatar_hair_style: 1,
  avatar_hair_color: 1,
  avatar_skin_tone: 1,
  avatar_eye_style: 1,
  avatar_eye_color: 1,
  avatar_mouth_style: 1,
  avatar_eyebrows: 1,
  avatar_shirt_color: 1,
  avatar_background_color: 1
});

export const getPlayerSurname = (fullName: string) => {
  const nameParts = fullName.split(' ');
  return nameParts[nameParts.length - 1];
};
