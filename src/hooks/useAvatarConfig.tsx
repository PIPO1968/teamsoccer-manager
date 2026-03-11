
import { useState, useEffect } from 'react';
import { AvatarConfig } from '@/components/avatar/AvatarCustomizer';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const defaultAvatarConfig: AvatarConfig = {
  gender: 'male',
  faceType: 2,
  bodyType: 1,
  bodyVariation: 1,
  faceTone: 1,
  eyeType: 2,
  eyeColor: 2,
  eyeMood: 1,
  eyebrows: 1,
  mouthType: 6,
  mouthMood: 1,
  noseType: 1,
  facialHair: 0,
  hairType: 1,
  hairColor: 3,
  shirtColor: 2,
  backgroundColor: 4,
  showAnniversaryBadge: false
};

export const useAvatarConfig = (managerId?: number) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [isLoading, setIsLoading] = useState(true);
  const { manager } = useAuth();

  const currentManagerId = managerId || manager?.user_id;

  useEffect(() => {
    const loadAvatarConfig = async () => {
      if (!currentManagerId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{ success: boolean; avatar: any }>(
          `/managers/${currentManagerId}/avatar`
        );

        if (data.avatar) {
          setAvatarConfig({
            gender: data.avatar.gender as 'male' | 'female',
            faceType: data.avatar.face_type,
            bodyType: data.avatar.body_type,
            bodyVariation: data.avatar.body_variation,
            faceTone: data.avatar.face_tone,
            eyeType: data.avatar.eye_type,
            eyeColor: data.avatar.eye_color,
            eyeMood: data.avatar.eye_mood,
            eyebrows: data.avatar.eyebrows,
            mouthType: data.avatar.mouth_type,
            mouthMood: data.avatar.mouth_mood,
            noseType: data.avatar.nose_type,
            facialHair: data.avatar.facial_hair,
            hairType: data.avatar.hair_type,
            hairColor: data.avatar.hair_color,
            shirtColor: data.avatar.shirt_color,
            backgroundColor: data.avatar.background_color,
            showAnniversaryBadge: data.avatar.show_anniversary_badge
          });
        } else {
          setAvatarConfig(defaultAvatarConfig);
        }
      } catch (error) {
        console.error('Error loading avatar config:', error);
        toast.error('Failed to load avatar configuration');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatarConfig();
  }, [currentManagerId]);

  const saveAvatarConfig = async (config: AvatarConfig) => {
    if (!currentManagerId) {
      toast.error('No manager ID available');
      return;
    }

    try {
      await apiFetch(`/managers/${currentManagerId}/avatar`, {
        method: 'PUT',
        body: JSON.stringify({
          gender: config.gender,
          face_type: config.faceType,
          body_type: config.bodyType,
          body_variation: config.bodyVariation,
          face_tone: config.faceTone,
          eye_type: config.eyeType,
          eye_color: config.eyeColor,
          eye_mood: config.eyeMood,
          eyebrows: config.eyebrows,
          mouth_type: config.mouthType,
          mouth_mood: config.mouthMood,
          nose_type: config.noseType,
          facial_hair: config.facialHair,
          hair_type: config.hairType,
          hair_color: config.hairColor,
          shirt_color: config.shirtColor,
          background_color: config.backgroundColor,
          show_anniversary_badge: config.showAnniversaryBadge
        }),
      });

      setAvatarConfig(config);
      toast.success('Avatar saved successfully!');
    } catch (error) {
      console.error('Error saving avatar config:', error);
      toast.error('Failed to save avatar configuration');
    }
  };

  const resetAvatarConfig = async () => {
    if (!currentManagerId) {
      toast.error('No manager ID available');
      return;
    }

    try {
      await apiFetch(`/managers/${currentManagerId}/avatar`, { method: 'DELETE' });
      setAvatarConfig(defaultAvatarConfig);
      toast.success('Avatar reset to default');
    } catch (error) {
      console.error('Error resetting avatar config:', error);
      toast.error('Failed to reset avatar configuration');
    }
  };

  return {
    avatarConfig,
    setAvatarConfig,
    saveAvatarConfig,
    resetAvatarConfig,
    isLoading
  };
};
