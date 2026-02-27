
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

const EmptyMatchState = () => {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">
          Match statistics will be available after the match
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyMatchState;
