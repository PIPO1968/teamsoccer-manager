
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Star } from "lucide-react";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface ShopContentProps {
  manager: any;
  isLoading: boolean;
  handlePurchase: (plan: string) => Promise<void>;
  onActivateFreePremium?: () => Promise<void>;
}

const FEATURES = [
  "Team Logo",
  "Avatars",
  "Trophy Shelf",
  "Auto Training",
  "Create Rooms",
  "Unavailable Match Hours",
  "Flag collection",
  "Auctions Auto-Bid",
  "Detailed Stats",
  "Multi/Match Viewer",
  "Custom tournaments",
  "Premium Cup",
  "50 TScredits",
];

const ShopContent = ({ manager, isLoading, handlePurchase, onActivateFreePremium }: ShopContentProps) => {
  const { formatPrice } = useCurrency(manager?.country_name);

  const isPremium =
    !!manager?.is_premium &&
    !!manager?.premium_expires_at &&
    new Date(manager.premium_expires_at) > new Date();

  const expiresAt = manager?.premium_expires_at ? new Date(manager.premium_expires_at) : null;
  const expiresStr = expiresAt
    ? `${format(expiresAt, "HH:mm")} h., ${format(expiresAt, "dd/MM/yyyy")}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Banner: Prepaid Supporter */}
      {isPremium && expiresStr && (
        <div className="bg-green-100 border border-green-400 rounded-lg p-4 text-center text-green-800 font-medium text-base">
          You have Prepaid Supporter until {expiresStr}
        </div>
      )}

      {/* Block 1: Premium Package features */}
      <Card className="border-2 border-yellow-400">
        <CardHeader className="bg-yellow-50 text-center rounded-t-lg">
          <CardTitle className="text-2xl tracking-wide">⭐★⭐ PREMIUM Package ⭐★⭐</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            The premium package for TeamSoccer.org offers several enhancements that enhance the
            gaming experience without providing any competitive advantage.
          </p>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Block 2: 1-Month Prepaid */}
      <Card>
        <CardHeader>
          <CardTitle>Premium 1-Month (Prepaid)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold">
            {formatPrice(4.59)}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="text-sm text-muted-foreground">Pay once {formatPrice(4.59)}</p>
          <p className="text-sm text-muted-foreground italic mt-1">
            Ideal for testing out features without a long-term commitment or as a gift to an
            in-game friend.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
            onClick={() => handlePurchase("1month")}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Purchase 1-Month Premium
          </Button>
        </CardFooter>
      </Card>

      {/* Block 3: 3-Months Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Premium 3-Months (Subscription)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold">
            {formatPrice(3.99)}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Billed every 3 months at {formatPrice(11.99)}
          </p>
          <p className="text-sm text-green-600 font-medium mt-1">
            Save 20% and lock in this great price for as long as you're subscribed. Cancel anytime.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
            onClick={() => handlePurchase("3months")}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subscribe 3-Month Premium
          </Button>
        </CardFooter>
      </Card>

      {/* Block 4: 12-Months Subscription — RECOMMENDED */}
      <Card className="border-2 border-teamsoccer-green relative">
        <div className="absolute top-3 right-3 bg-teamsoccer-green text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="h-3 w-3 fill-white" />
          RECOMMENDED
        </div>
        <CardHeader>
          <CardTitle>Premium 12-Months (Subscription)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold">
            {formatPrice(3.33)}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Billed every 12 months at {formatPrice(39.99)}
          </p>
          <p className="text-sm text-green-600 font-medium mt-1">
            Save 27.40% and lock in this great price for as long as you're subscribed. Cancel
            anytime.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white"
            onClick={() => handlePurchase("12months")}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subscribe 12-Month Premium
          </Button>
        </CardFooter>
      </Card>

      {/* Block 5: Free Premium — new managers only */}
      <Card className="border-2 border-yellow-300 bg-yellow-50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">★ FREE PREMIUM ★ (30 DAYS)</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Premium Gratis para nuevos managers (30 días)
        </CardContent>
        {manager?.status === 'carnet_pending' && onActivateFreePremium && (
          <CardFooter className="justify-center">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
              onClick={onActivateFreePremium}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activar mis 30 días Premium gratis
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Block 6: Additional Team — RECOMMENDED */}
      <Card className="border-2 border-blue-400 relative">
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="h-3 w-3 fill-white" />
          RECOMMENDED
        </div>
        <CardHeader>
          <CardTitle>"ADDITIONAL TEAM"</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enhance your gaming experience with an additional team in a different country.
          </p>
          <p className="text-3xl font-bold">
            {formatPrice(24.99)}
            <span className="text-base font-normal text-muted-foreground">/year</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handlePurchase("additional_team")}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Additional Team
          </Button>
        </CardFooter>
      </Card>

      {/* Block 7: TSCredits */}
      <Card>
        <CardHeader>
          <CardTitle>TSCREDITS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { amount: 10, price: 3 },
              { amount: 25, price: 6 },
              { amount: 50, price: 10 },
              { amount: 100, price: 18 },
            ].map(({ amount, price }) => (
              <div key={amount} className="border rounded-lg p-3 text-center space-y-2">
                <p className="text-2xl font-bold">{amount}</p>
                <p className="text-xs text-muted-foreground">TScredits</p>
                <p className="text-sm font-medium">{formatPrice(price)}</p>
                <Button
                  size="sm"
                  className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark text-white text-xs"
                  onClick={() => handlePurchase(`credits_${amount}`)}
                  disabled={isLoading}
                >
                  Buy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ShopContent;
