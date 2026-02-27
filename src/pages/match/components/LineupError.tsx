
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LineupError: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
            <p className="text-muted-foreground mb-6">This match doesn't exist or you don't have access to set the lineup.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LineupError;
