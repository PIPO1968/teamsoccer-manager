
import { useState, useEffect } from 'react';
import { AvatarConfig } from '@/components/avatar/AvatarCustomizer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Updated default avatar with specific values
const defaultAvatarConfig: AvatarConfig = {
  gender: 'male',
  faceType: 2, // Standard face
  bodyType: 1,
  bodyVariation: 1,
  faceTone: 1, // Light skin tone
  eyeType: 2, // Round eyes
  eyeColor: 2, // Dark Gray eyes
  eyeMood: 1, // Default eye color
  eyebrows: 1, // Up eyebrows
  mouthType: 6, // Smile mouth
  mouthMood: 1,
  noseType: 1, // Normal nose
  facialHair: 0, // No facial hair
  hairType: 1, // Fonze hair
  hairColor: 3, // Black hair
  shirtColor: 2, // Green shirt
  backgroundColor: 4, // Cream background
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
        console.log('Loading avatar config for manager:', currentManagerId);
        
        const { data, error } = await supabase
          .from('avatar_configs')
          .select('*')
          .eq('manager_id', currentManagerId)
          .maybeSingle();

        if (error) {
          console.error('Error loading avatar config:', error);
          toast.error('Failed to load avatar configuration');
          return;
        }

        if (data) {
          console.log('Avatar config loaded:', data);
          setAvatarConfig({
            gender: data.gender as 'male' | 'female',
            faceType: data.face_type,
            bodyType: data.body_type,
            bodyVariation: data.body_variation,
            faceTone: data.face_tone,
            eyeType: data.eye_type,
            eyeColor: data.eye_color,
            eyeMood: data.eye_mood,
            eyebrows: data.eyebrows,
            mouthType: data.mouth_type,
            mouthMood: data.mouth_mood,
            noseType: data.nose_type,
            facialHair: data.facial_hair,
            hairType: data.hair_type,
            hairColor: data.hair_color,
            shirtColor: data.shirt_color,
            backgroundColor: data.background_color,
            showAnniversaryBadge: data.show_anniversary_badge
          });
        } else {
          console.log('No avatar config found, using default');
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
      console.log('Saving avatar config for manager:', currentManagerId, config);

      const avatarData = {
        manager_id: currentManagerId,
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
        show_anniversary_badge: config.showAnniversaryBadge,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('avatar_configs')
        .upsert(avatarData, {
          onConflict: 'manager_id'
        });

      if (error) {
        console.error('Error saving avatar config:', error);
        toast.error('Failed to save avatar configuration');
        return;
      }

      setAvatarConfig(config);
      toast.success('Avatar saved successfully!');
      console.log('Avatar config saved successfully');
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
      console.log('Resetting avatar config for manager:', currentManagerId);

      const { error } = await supabase
        .from('avatar_configs')
        .delete()
        .eq('manager_id', currentManagerId);

      if (error) {
        console.error('Error resetting avatar config:', error);
        toast.error('Failed to reset avatar configuration');
        return;
      }

      setAvatarConfig(defaultAvatarConfig);
      toast.success('Avatar reset to default');
      console.log('Avatar config reset successfully');
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
