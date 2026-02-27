
import React from "react";
import SubscriptionStatus from "./SubscriptionStatus";
import PremiumFeaturesList from "./PremiumFeaturesList";
import SubscriptionBenefits from "./SubscriptionBenefits";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ShopContentProps {
  manager: any;
  isLoading: boolean;
  handlePurchasePremium: () => Promise<void>;
}

const ShopContent = ({ manager, isLoading, handlePurchasePremium }: ShopContentProps) => {
  // Calculate if premium is about to expire (within 7 days)
  const isPremium = !!manager?.is_premium && 
    !!manager?.premium_expires_at && 
    new Date(manager.premium_expires_at) > new Date();
    
  const isPremiumExpiringSoon = isPremium && manager?.premium_expires_at && 
    (new Date(manager.premium_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7;
  
  console.log("ShopContent - Premium status:", isPremium); // Debug
  console.log("ShopContent - Is expiring soon:", isPremiumExpiringSoon); // Debug

  return (
    <>
      {isPremium ? (
        <PremiumMemberContent 
          manager={manager} 
          isPremiumExpiringSoon={isPremiumExpiringSoon}
          isLoading={isLoading}
          handlePurchasePremium={handlePurchasePremium}
        />
      ) : (
        <NonPremiumContent 
          isLoading={isLoading}
          handlePurchasePremium={handlePurchasePremium}
        />
      )}
    </>
  );
};

interface PremiumMemberContentProps {
  manager: any;
  isPremiumExpiringSoon: boolean;
  isLoading: boolean;
  handlePurchasePremium: () => Promise<void>;
}

const PremiumMemberContent = ({ 
  manager, 
  isPremiumExpiringSoon,
  isLoading,
  handlePurchasePremium 
}: PremiumMemberContentProps) => {
  return (
    <div className="max-w-lg mx-auto">
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle>Premium Access</CardTitle>
          <CardDescription>You currently have premium access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Thank you for being a Premium member! You have access to all premium features.</p>
          <p>Your premium access will expire on {manager?.premium_expires_at ? 
              new Date(manager.premium_expires_at).toLocaleDateString() : 'N/A'}.</p>
          {isPremiumExpiringSoon && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mt-4">
              <p className="text-yellow-700 font-medium">Your premium access is expiring soon!</p>
              <p className="text-sm text-yellow-600">Renew now to maintain uninterrupted access to premium features.</p>
            </div>
          )}
        </CardContent>
        {isPremiumExpiringSoon && (
          <CardFooter>
            <Button 
              className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
              onClick={handlePurchasePremium}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Renew Premium Access"
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
      
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>Premium access is valid for 30 days from purchase.</p>
        <p>You will need to manually renew your premium access before it expires.</p>
      </div>
    </div>
  );
};

interface NonPremiumContentProps {
  isLoading: boolean;
  handlePurchasePremium: () => Promise<void>;
}

const NonPremiumContent = ({ isLoading, handlePurchasePremium }: NonPremiumContentProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <SubscriptionBenefits />
      
      <Card className="shadow-md border-2 border-teamsoccer-green/20">
        <CardHeader className="text-center bg-teamsoccer-green text-white">
          <CardTitle className="text-2xl">Premium Access</CardTitle>
          <CardDescription className="text-white/90">
            Everything you need to excel as a manager
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">$3.99</span>
            <span className="text-muted-foreground"> for 30 days</span>
          </div>
          
          <PremiumFeaturesList />
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button 
            size="lg" 
            className="w-full py-6 text-lg bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
            onClick={handlePurchasePremium}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Purchase Premium"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center md:col-span-2 mt-6 text-sm text-muted-foreground">
        <p>Premium access is valid for 30 days from purchase.</p>
        <p>This is a one-time payment and will not automatically renew.</p>
      </div>
    </div>
  );
};

export default ShopContent;
