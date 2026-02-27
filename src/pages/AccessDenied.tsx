
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { GAME_NAME } from "@/config/constants";

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">Access Not Available</CardTitle>
          <CardDescription className="text-base">
            The game is under development and access is not enabled at the moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {GAME_NAME} is currently in development. Please check back later for updates.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link to="/login">Try Different Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
