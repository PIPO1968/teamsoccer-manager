
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/services/apiClient";
import { toast } from "sonner";
import { GAME_NAME } from "@/config/constants";
import ShopContent from "@/components/shop/ShopContent";
import ErrorDetailsDialog from "@/components/shop/ErrorDetailsDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Shop = () => {
  const { manager } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Fetch the latest manager data to make sure we have the most up-to-date premium status
  useEffect(() => {
    const fetchManagerData = async () => {
      if (manager?.user_id) {
        setIsRefreshing(true);
        try {
          const data = await apiFetch<{
            success: boolean;
            is_premium: number;
            premium_expires_at: string | null;
            is_admin: number;
            country_name: string | null;
          }>(`/managers/${manager.user_id}/info`);

          if (data) {
            const updatedManager = { ...manager, is_premium: data.is_premium, premium_expires_at: data.premium_expires_at, is_admin: data.is_admin, country_name: data.country_name ?? manager.country_name };
            localStorage.setItem('manager', JSON.stringify(updatedManager));
          }
        } catch (error) {
          console.error("Error fetching manager data:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    fetchManagerData();
  }, [manager?.user_id]);

  const handlePurchase = async (plan: string) => {
    if (!manager) {
      toast.error(t('shop.loginRequired'));
      return;
    }

    setIsLoading(true);
    try {
      console.log("Initiating checkout with user ID:", manager.user_id, "plan:", plan);

      // Llama a la API Express para crear la sesión de checkout
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: manager.user_id, plan })
      });
      if (!response.ok) throw new Error('No se pudo crear la sesión de pago');
      const data = await response.json();
      if (!data?.url) {
        throw new Error("No checkout URL returned from the server");
      }
      console.log("Checkout URL received:", data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);

      // Improved error message based on error type
      if (error.type === "stripe_error") {
        toast.error(`Stripe error: ${error.message}`);
      } else {
        toast.error(t('shop.checkoutError'));
      }

      setErrorDetails(JSON.stringify(error, null, 2));
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{GAME_NAME} Premium</h1>
        <p className="text-lg text-muted-foreground">
          {manager?.is_premium
            ? t('shop.manageAccess')
            : t('shop.upgradeDesc')}
        </p>
      </div>

      <ShopContent
        manager={manager}
        isLoading={isLoading}
        handlePurchase={handlePurchase}
      />

      {/* Error Dialog */}
      <ErrorDetailsDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        errorDetails={errorDetails}
      />
    </div>
  );
};

export default Shop;
