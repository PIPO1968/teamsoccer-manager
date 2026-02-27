
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

interface PremiumFeatureNoticeProps {
  title?: string;
  description?: string;
  showButton?: boolean;
  buttonText?: string;
}

const PremiumFeatureNotice = ({
  title = "Premium Feature",
  description = "This feature requires a premium subscription.",
  showButton = true,
  buttonText = "Upgrade to Premium"
}: PremiumFeatureNoticeProps) => {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg text-yellow-700">{title}</CardTitle>
        </div>
        <CardDescription className="text-yellow-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-yellow-700">
        <p>Unlock advanced features and gain a competitive advantage with a Premium subscription.</p>
      </CardContent>
      {showButton && (
        <CardFooter>
          <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
            <Link to="/shop">{buttonText}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PremiumFeatureNotice;
