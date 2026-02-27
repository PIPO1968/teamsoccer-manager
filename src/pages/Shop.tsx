
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GAME_NAME } from "@/config/constants";
import ShopContent from "@/components/shop/ShopContent";
import ErrorDetailsDialog from "@/components/shop/ErrorDetailsDialog";

const Shop = () => {
  const { manager } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Fetch the latest manager data from Supabase to make sure we have the most up-to-date premium status
  useEffect(() => {
    const fetchManagerData = async () => {
      if (manager?.user_id) {
        setIsRefreshing(true);
        try {
          const { data, error } = await supabase
            .from('managers')
            .select('user_id, username, email, is_admin, is_premium, premium_expires_at')
            .eq('user_id', manager.user_id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            console.log("Refreshed manager data:", data);
            // Update localStorage with the fresh data
            const updatedManager = { ...manager, ...data };
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

  const handlePurchasePremium = async () => {
    if (!manager) {
      toast.error("You must be logged in to purchase premium.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Initiating checkout with user ID:", manager.user_id);
      
      // Call the Supabase Edge Function to create a checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { user: manager.user_id },
      });

      if (error) {
        console.error("Error from create-checkout function:", error);
        throw error;
      }
      
      if (!data?.url) {
        throw new Error("No checkout URL returned from the server");
      }
      
      console.log("Checkout URL received:", data.url);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      
      // Improved error message based on error type
      if (error.type === "stripe_error") {
        toast.error(`Stripe error: ${error.message}`);
      } else {
        toast.error("Failed to initiate checkout. Please try again.");
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
            ? "Manage your premium access" 
            : "Upgrade your manager experience with premium features"}
        </p>
      </div>

      <ShopContent 
        manager={manager} 
        isLoading={isLoading} 
        handlePurchasePremium={handlePurchasePremium}
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
