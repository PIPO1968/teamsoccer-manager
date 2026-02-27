
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTeam } from "@/hooks/useUserTeam";
import { Input } from "@/components/ui/input";
import type { TeamData } from "@/hooks/useTeamData";

const MAX_FILE_SIZE = 500 * 1024; // 100 kB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png'];
const TARGET_WIDTH = 300;
const TARGET_HEIGHT = 300;

interface TeamLogoUploadProps {
  team: TeamData | null;
}

export const TeamLogoUpload = ({ team }: TeamLogoUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { manager } = useAuth();
  const { refetch } = useUserTeam();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 500 kB.",
        variant: "destructive"
      });
      return;
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast({
        title: "Invalid File Format",
        description: "Only JPG and PNG formats are allowed.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = TARGET_WIDTH;
          canvas.height = TARGET_HEIGHT;
          const ctx = canvas.getContext('2d');
          
          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const x = (canvas.width - scaledWidth) / 2;
          const y = (canvas.height - scaledHeight) / 2;

          ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);
          resolve(canvas.toDataURL(file.type));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !team || !manager) return;

    try {
      setIsUploading(true);
      const resizedImage = await resizeImage(selectedFile);

      const teamId = typeof team.team_id === 'string' 
        ? parseInt(team.team_id, 10) 
        : team.team_id;
        
      console.log("Uploading logo for team:", teamId);
      console.log("Current team data:", team);
      console.log("Current manager:", manager);
      
      const { data, error } = await supabase
        .from('teams')
        .update({ 
          club_logo: resizedImage,
          updated_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .eq('manager_id', manager.user_id);
        
      if (error) {
        console.error("Error updating team logo:", error);
        throw error;
      }

      console.log("Update response:", data);
      
      toast({
        title: "Logo Updated",
        description: "Your team logo has been successfully updated."
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      
      await refetch();
      console.log("Team data refetched after logo update");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error("Logo upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const isTeamManager = team && manager && String(team.manager_id) === String(manager.user_id);
  
  console.log("Team manager check:", {
    teamManagerId: team?.manager_id,
    currentManagerId: manager?.user_id,
    isTeamManager
  });

  if (!isTeamManager) {
    console.log("Not showing logo upload UI - user is not team manager");
    return null;
  }

  return (
    <div className="flex flex-col space-y-2">
      <Input 
        type="file" 
        accept=".jpg,.jpeg,.png"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-2"
      />
      <Button 
        onClick={handleUpload} 
        disabled={!selectedFile || isUploading}
        className="w-full"
      >
        {isUploading ? "Uploading..." : "Upload Logo"}
      </Button>
    </div>
  );
};
