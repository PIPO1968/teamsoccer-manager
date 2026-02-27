
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomizationOption } from './CustomizationOption';
import { avatarOptions } from './avatarOptions';
import { AvatarConfig } from './AvatarCustomizer';

interface CustomizationControlsProps {
  config: AvatarConfig;
  onConfigUpdate: (key: keyof AvatarConfig, value: any) => void;
  onSave: () => void;
  onReset: () => void;
}

export const CustomizationControls: React.FC<CustomizationControlsProps> = ({
  config,
  onConfigUpdate,
  onSave,
  onReset
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="max-h-80 overflow-y-auto space-y-1">
          {/* Hair Style */}
          <CustomizationOption
            label="Hair style"
            value={config.hairType}
            onChange={(value) => onConfigUpdate('hairType', value)}
            max={8}
            options={avatarOptions.hairStyles}
          />

          {/* Hair Color */}
          <CustomizationOption
            label="Hair color"
            value={config.hairColor}
            onChange={(value) => onConfigUpdate('hairColor', value)}
            max={8}
            options={avatarOptions.hairColors}
          />

          {/* Eye Style */}
          <CustomizationOption
            label="Eye style"
            value={config.eyeType}
            onChange={(value) => onConfigUpdate('eyeType', value)}
            max={5}
            options={avatarOptions.eyeStyles}
          />

          {/* Eye Color */}
          <CustomizationOption
            label="Eye color"
            value={config.eyeColor}
            onChange={(value) => onConfigUpdate('eyeColor', value)}
            max={6}
            options={avatarOptions.eyeColors}
          />

          {/* Eyebrows */}
          <CustomizationOption
            label="Eyebrows"
            value={config.eyebrows}
            onChange={(value) => onConfigUpdate('eyebrows', value)}
            max={4}
            options={avatarOptions.eyebrowStyles}
          />

          {/* Mouth */}
          <CustomizationOption
            label="Mouth style"
            value={config.mouthType}
            onChange={(value) => onConfigUpdate('mouthType', value)}
            max={7}
            options={avatarOptions.mouthStyles}
          />

          {/* Skin Tone */}
          <CustomizationOption
            label="Skin tone"
            value={config.faceTone}
            onChange={(value) => onConfigUpdate('faceTone', value)}
            max={4}
            options={avatarOptions.skinTones}
          />

          {/* Shirt Color */}
          <CustomizationOption
            label="Shirt color"
            value={config.shirtColor}
            onChange={(value) => onConfigUpdate('shirtColor', value)}
            max={6}
            options={avatarOptions.shirtColors}
          />

          {/* Background Color */}
          <CustomizationOption
            label="Background color"
            value={config.backgroundColor}
            onChange={(value) => onConfigUpdate('backgroundColor', value)}
            max={6}
            options={avatarOptions.backgroundColors}
          />
        </div>

        {/* Action Buttons - Always visible */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 mt-4">
          <Button onClick={onReset} variant="outline" className="flex-1">
            Reset
          </Button>
          <Button onClick={onSave} className="flex-1">
            Save Avatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
