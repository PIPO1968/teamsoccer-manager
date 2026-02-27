
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarConfig } from './AvatarCustomizer';

interface AvatarPreviewProps {
  config: AvatarConfig;
  onRandomize: () => void;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  config,
  onRandomize
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Avatar Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <AvatarDisplay config={config} size="lg" />
        <Button
          onClick={onRandomize}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Randomize
        </Button>
      </CardContent>
    </Card>
  );
};
