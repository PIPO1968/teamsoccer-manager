
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { manager } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // In a production environment, you would verify the session
        // For now, we'll just simulate a successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // After successful payment, refresh the manager data to get updated premium status
        if (manager?.user_id) {
          const response = await fetch(`/api/managers/${manager.user_id}`);
          if (!response.ok) throw new Error('No se pudo obtener datos del manager');
          const data = await response.json();
          // Si se requiere actualizar el contexto, debe hacerse vía signIn del AuthContext
          // const updatedManager = { ...manager, ...data.manager };
          // signIn(updatedManager); // Descomentar si se desea refrescar el contexto
        }

        setLoading(false);
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError("Failed to verify your payment. Please contact support.");
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, manager?.user_id]);

  const premiumExpiresAt = manager?.premium_expires_at ? new Date(manager.premium_expires_at).toLocaleDateString() : 'N/A';
  // Obtener la fecha de expiración solo desde el contexto
  const premiumExpiresAt = manager?.premium_expires_at ? new Date(manager.premium_expires_at).toLocaleDateString() : 'N/A';

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="shadow-lg border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for purchasing Premium
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <p>Verifying your payment...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <p>Your premium access has been activated.</p>
              <p className="mt-2">
                <span className="font-medium">Valid until:</span> {premiumExpiresAt}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Remember, this is a one-time purchase that needs to be manually renewed before it expires.
              </p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-hattrick-green hover:bg-hattrick-green-dark">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
