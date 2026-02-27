
import React from 'react';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { PlayerData } from '@/hooks/useTeamPlayers';

interface PlayerAvatarProps {
  player: PlayerData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ 
  player, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Generate the avatar SVG using player's configuration
  const generatePlayerAvatarSvg = () => {
    try {
      // Map avatar configuration numbers to DiceBear options
      const hairColors = ['0e7c7b', '17805e', '181425', '28e1c2', '2c1b18', '6d4b1a', '86380c', '8a2333'] as const;
      const skinColors = ['ffdbac', 'f5deb3', 'deb887', 'cd853f'] as const;
      
      // Valid male-only options for DiceBear micah style, excluding forbidden hair styles
      const validMaleHair = ['fonze', 'mrT', 'dougFunny', 'mrClean', 'dannyPhantom'] as const;
      const validMaleMouths = ['frown', 'laughing', 'nervous', 'sad', 'smile', 'smirk'] as const;
      const validMaleEyes = ['eyes', 'round', 'eyesShadow', 'smiling', 'smilingShadow'] as const;
      const validMaleEyebrows = ['up', 'down'] as const;
      
      type HairType = typeof validMaleHair[number];
      type MouthType = typeof validMaleMouths[number];
      type EyeType = typeof validMaleEyes[number];
      type EyebrowType = typeof validMaleEyebrows[number];
      
      // Ensure we always get a valid male hair style by using modulo to wrap around
      const hairIndex = ((player.avatar_hair_style || 1) - 1) % validMaleHair.length;
      const selectedHair: HairType = validMaleHair[hairIndex];
      
      const mouthIndex = ((player.avatar_mouth_style || 1) - 1) % validMaleMouths.length;
      const selectedMouth: MouthType = validMaleMouths[mouthIndex];
      
      const eyeIndex = ((player.avatar_eye_style || 1) - 1) % validMaleEyes.length;
      const selectedEye: EyeType = validMaleEyes[eyeIndex];
      
      const eyebrowIndex = ((player.avatar_eyebrows || 1) - 1) % validMaleEyebrows.length;
      const selectedEyebrows: EyebrowType = validMaleEyebrows[eyebrowIndex];
      
      const options = {
        // Use player's unique seed
        seed: player.avatar_seed || `player_${player.player_id}`,
        
        // Fixed background color - light blue
        backgroundColor: ['e0f2fe'],
        
        // Hair style and color - male only, excluding forbidden styles
        hair: [selectedHair],
        hairColor: [hairColors[(player.avatar_hair_color || 1) - 1] || hairColors[0]],
        
        // Eyes style and color - always black
        eyes: [selectedEye],
        eyesColor: ['000000'], // Always black eyes
        
        // Eyebrows - male only
        eyebrows: [selectedEyebrows],
        
        // Mouth - male only
        mouth: [selectedMouth],
        
        // Skin tone
        skinColor: [skinColors[(player.avatar_skin_tone || 1) - 1] || skinColors[0]],
        
        // Fixed shirt color - blue
        shirtColor: ['0ea5e9'],
        
        // Disable earrings, glasses and other feminine features
        earrings: [],
        glasses: [], // No glasses
      };

      const avatar = createAvatar(micah, options);
      return avatar.toString();
    } catch (error) {
      console.error('Error generating player avatar:', error);
      return '';
    }
  };

  const avatarSvg = generatePlayerAvatarSvg();

  return (
    <div className={`relative ${className || sizeClasses[size]}`}>
      <div 
        className="w-full h-full rounded-full border-2 border-gray-200 overflow-hidden bg-white"
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
        title={`${player.first_name} ${player.last_name}`}
      />
    </div>
  );
};
