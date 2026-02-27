
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect } from "react";

interface SubscriptionStatusProps {
  manager: {
    user_id: number;
    username: string;
    email: string;
    is_admin: number;
    team_id?: number;
    is_premium?: number;
    premium_expires_at?: string;
  };
  onRenewClick?: () => void;
}

const SubscriptionStatus = ({ manager, onRenewClick }: SubscriptionStatusProps) => {
  // Check if the user has an active premium status
  const hasActivePremium = manager.is_premium === 1 && manager.premium_expires_at && new Date(manager.premium_expires_at) > new Date();
  
  useEffect(() => {
    console.log("SubscriptionStatus - Manager data:", manager);
    console.log("SubscriptionStatus - Has active premium:", hasActivePremium);
    console.log("SubscriptionStatus - is_premium value:", manager.is_premium);
    console.log("SubscriptionStatus - premium_expires_at:", manager.premium_expires_at);
    console.log("SubscriptionStatus - premium valid until:", manager.premium_expires_at ? new Date(manager.premium_expires_at) : "N/A");
    console.log("SubscriptionStatus - current date:", new Date());
  }, [manager, hasActivePremium]);

  if (!hasActivePremium) {
    return null;
  }

  // Calculate days remaining until expiration
  const today = new Date();
  const expiresAt = manager.premium_expires_at ? new Date(manager.premium_expires_at) : null;
  const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Card className="mb-8 border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-green-700">
              You have active Premium access
            </h3>
            {manager.premium_expires_at && (
              <p className="text-sm text-green-600">
                Your premium access expires on {format(new Date(manager.premium_expires_at), 'MMMM d, yyyy')}
                {daysRemaining > 0 && <span className="font-medium"> ({daysRemaining} days remaining)</span>}
              </p>
            )}
          </div>
          {onRenewClick && daysRemaining <= 7 && (
            <Button 
              variant="outline" 
              className="border-green-500 text-green-700 hover:bg-green-100"
              onClick={onRenewClick}
            >
              Renew Premium Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
