
import { Player } from '../../types/match';
import { PlayerData } from '@/hooks/useTeamPlayers';

export const convertToPlayerData = (player: Player): PlayerData => {
  // Split the full name into first and last name
  const nameParts = player.name.split(' ');
  const firstName = player.firstName || nameParts[0] || 'Unknown';
  const lastName = player.lastName || nameParts.slice(1).join(' ') || 'Player';

  return {
    player_id: player.id,
    first_name: firstName,
    last_name: lastName,
    position: player.position,
    age: 25, // Default age since it's not in Player type
    nationality_id: 1, // Default nationality
    nationality: 'Unknown',
    value: 1000000, // Default value
    wage: 10000, // Default wage
    fitness: player.fitness || 100,
    form: player.form || 'Average',
    contract_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString(), // 2 years from now
    finishing: player.finishing || 10,
    pace: 10, // Default pace
    passing: player.passing || 10,
    defense: player.defense || 10,
    dribbling: player.dribbling || 10,
    heading: 10, // Default heading
    stamina: 10, // Default stamina
    team_id: null,
    goals: 0,
    assists: 0,
    matches_played: 0,
    minutes_played: 0,
    rating: player.rating || 7,
    personality: 5,
    experience: 5,
    leadership: 5,
    loyalty: 5,
    owned_since: null,
    // Avatar configuration - use defaults if not available
    avatar_seed: `player_${player.id}`,
    avatar_hair_style: 1,
    avatar_hair_color: 1,
    avatar_skin_tone: 1,
    avatar_eye_style: 1,
    avatar_eye_color: 1,
    avatar_mouth_style: 1,
    avatar_eyebrows: 1,
    avatar_shirt_color: 1,
    avatar_background_color: 1
  };
};

export const getPlayerSurname = (fullName: string): string => {
  const nameParts = fullName.split(' ');
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : fullName;
};
