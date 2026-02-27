
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface GroupLogoUploadProps {
  group: {
    id: number;
    club_logo?: string | null;
  };
}

export const GroupLogoUpload = ({ group }: GroupLogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { manager } = useAuth();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // 500KB limit
      toast({
        title: "File Too Large",
        description: "Image must be less than 500KB",
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
          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !group || !manager) return;

    try {
      setIsUploading(true);
      const resizedImage = await resizeImage(selectedFile);

      const { error } = await supabase
        .from('groups')
        .update({ 
          club_logo: resizedImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id)
        .eq('owner_id', manager.user_id);

      if (error) throw error;

      toast({
        title: "Logo Updated",
        description: "Your group logo has been successfully updated."
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
      
      // Reload the page to show the new logo
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
