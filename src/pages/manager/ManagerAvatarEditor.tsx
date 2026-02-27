
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import { useAvatarConfig } from "@/hooks/useAvatarConfig";

interface ManagerAvatarEditorProps {
  managerId: number;
  onBack: () => void;
}

export const ManagerAvatarEditor: React.FC<ManagerAvatarEditorProps> = ({
  managerId,
  onBack
}) => {
  const { avatarConfig, setAvatarConfig, saveAvatarConfig, resetAvatarConfig, isLoading } = useAvatarConfig(managerId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading avatar editor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
        <h2 className="text-2xl font-bold">Edit Avatar</h2>
      </div>

      <AvatarCustomizer
        config={avatarConfig}
        onConfigChange={setAvatarConfig}
        onSave={() => saveAvatarConfig(avatarConfig)}
        onReset={resetAvatarConfig}
      />
    </div>
  );
};
