
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface MatchHighlightsBlockProps {
  matchId?: number;
}

const MatchHighlightsBlock: React.FC<MatchHighlightsBlockProps> = ({ matchId }) => {
  return (
    <Card className="w-80 h-fit">
      <CardHeader className="py-4 px-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Highlights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">No highlights yet</p>
      </CardContent>
    </Card>
  );
};

export default MatchHighlightsBlock;
