
import React from 'react';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { AvatarConfig } from './AvatarCustomizer';

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  config, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  // Map our config to DiceBear options for micah collection
  const getDiceBearOptions = () => {
    const hairColors = ['0e7c7b', '17805e', '181425', '28e1c2', '2c1b18', '6d4b1a', '86380c', '8a2333'] as const;
    const skinColors = ['ffdbac', 'f5deb3', 'deb887', 'cd853f'] as const;
    const eyeColors = ['6b7280', '1f2937', '065f46', '7c2d12', '1e40af', '7e22ce'] as const;
    const shirtColors = ['0ea5e9', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'] as const;
    const backgroundColors = ['ffdfbf', 'feccc9', 'ffd5dc', 'ffdbac', 'e0f2fe', 'f3e8ff'] as const;
    
    // Valid options for DiceBear micah style - corrected to match actual collection
    const validHair = ['fonze', 'full', 'pixie', 'turban', 'mrT', 'dougFunny', 'mrClean', 'dannyPhantom'] as const;
    const validMouths = ['frown', 'laughing', 'nervous', 'pucker', 'sad', 'smile', 'smirk'] as const;
    const validEyes = ['eyes', 'round', 'eyesShadow', 'smiling', 'smilingShadow'] as const;
    const validEyebrows = ['up', 'down', 'eyelashesUp', 'eyelashesDown'] as const;
    
    type HairType = typeof validHair[number];
    type MouthType = typeof validMouths[number];
    type EyeType = typeof validEyes[number];
    type EyebrowType = typeof validEyebrows[number];
    
    const selectedHair: HairType = validHair[config.hairType - 1] || validHair[0];
    const selectedMouth: MouthType = validMouths[config.mouthType - 1] || validMouths[0];
    const selectedEye: EyeType = validEyes[config.eyeType - 1] || validEyes[0];
    const selectedEyebrows: EyebrowType = validEyebrows[config.eyebrows - 1] || validEyebrows[0];
    
    return {
      // Fixed seed to "Emery" - never changes
      seed: 'Emery',
      
      // Background color
      backgroundColor: [backgroundColors[config.backgroundColor - 1] || backgroundColors[0]],
      
      // Hair style and color
      hair: [selectedHair],
      hairColor: [hairColors[config.hairColor - 1] || hairColors[0]],
      
      // Eyes style and color
      eyes: [selectedEye],
      eyesColor: [eyeColors[config.eyeColor - 1] || eyeColors[0]],
      
      // Eyebrows
      eyebrows: [selectedEyebrows],
      
      // Mouth
      mouth: [selectedMouth],
      
      // Skin tone - fixed property name to match DiceBear API
      skinColor: [skinColors[config.faceTone - 1] || skinColors[0]],
      
      // Shirt color
      shirtColor: [shirtColors[config.shirtColor - 1] || shirtColors[0]],
      
      // Explicitly disable earrings
      earrings: [],
    };
  };

  // Generate the avatar SVG
  const generateAvatarSvg = () => {
    try {
      const avatar = createAvatar(micah, getDiceBearOptions());
      return avatar.toString();
    } catch (error) {
      console.error('Error generating avatar:', error);
      return '';
    }
  };

  const avatarSvg = generateAvatarSvg();

  return (
    <div className={`relative ${className || sizeClasses[size]}`}>
      <div 
        className="w-full h-full rounded-full border-2 border-gray-200 overflow-hidden bg-white"
        dangerouslySetInnerHTML={{ __html: avatarSvg }}
      />
    </div>
  );
};
