import React from 'react';
import { AvatarPreview } from './AvatarPreview';
import { CustomizationControls } from './CustomizationControls';

export interface AvatarConfig {
  gender: 'male' | 'female';
  faceType: number;
  bodyType: number;
  bodyVariation: number;
  faceTone: number;
  eyeType: number;
  eyeColor: number;
  eyeMood: number;
  eyebrows: number;
  mouthType: number;
  mouthMood: number;
  noseType: number;
  facialHair: number;
  hairType: number;
  hairColor: number;
  shirtColor: number;
  backgroundColor: number;
  showAnniversaryBadge: boolean;
}

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onConfigChange: (config: AvatarConfig) => void;
  onSave: () => void;
  onReset: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  config,
  onConfigChange,
  onSave,
  onReset
}) => {
  const updateConfig = (key: keyof AvatarConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  const randomizeAll = () => {
    const randomConfig: AvatarConfig = {
      // Keep existing values for unused options
      gender: config.gender,
      faceType: config.faceType,
      bodyType: config.bodyType,
      bodyVariation: config.bodyVariation,
      eyeMood: config.eyeMood,
      mouthMood: config.mouthMood,
      facialHair: config.facialHair,
      showAnniversaryBadge: config.showAnniversaryBadge,
      noseType: config.noseType, // Keep existing value since we're not using it
      
      // Randomize the active options
      faceTone: Math.floor(Math.random() * 4) + 1,
      eyeType: Math.floor(Math.random() * 5) + 1,
      eyeColor: Math.floor(Math.random() * 6) + 1,
      eyebrows: Math.floor(Math.random() * 4) + 1, // Updated to 4 options
      mouthType: Math.floor(Math.random() * 7) + 1,
      hairType: Math.floor(Math.random() * 8) + 1,
      hairColor: Math.floor(Math.random() * 8) + 1,
      shirtColor: Math.floor(Math.random() * 6) + 1,
      backgroundColor: Math.floor(Math.random() * 6) + 1,
    };
    onConfigChange(randomConfig);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AvatarPreview config={config} onRandomize={randomizeAll} />
      <CustomizationControls
        config={config}
        onConfigUpdate={updateConfig}
        onSave={onSave}
        onReset={onReset}
      />
    </div>
  );
};
