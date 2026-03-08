
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    logStep("Function started");

    // Get Stripe secret key from environment
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in the environment");
    }

    // Initialize Stripe with the API key
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const { user } = await req.json();
    logStep("Received request for user", user);

    if (!user) {
      throw new Error("User ID is required");
    }

    // Set the premium duration (30 days from now)
    const premiumExpiresAt = new Date();
    premiumExpiresAt.setDate(premiumExpiresAt.getDate() + 30);
    logStep("Premium will expire at", premiumExpiresAt.toISOString());

    // Create a one-time payment checkout session with Stripe
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "TeamSoccer: Premium",
                description: "Unlock premium features for 30 days"
              },
              unit_amount: 399, // $3.99
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get("origin")}/shop`,
        client_reference_id: user.toString(), // Reference to the user
        metadata: {
          premium_expires_at: premiumExpiresAt.toISOString(),
        },
      });

      logStep("Created checkout session", {
        sessionId: session.id,
        url: session.url,
        expiresAt: premiumExpiresAt.toISOString()
      });

      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError) {
      logStep("Stripe API error", {
        error: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      });

      return new Response(JSON.stringify({
        error: stripeError.message,
        type: "stripe_error",
        code: stripeError.code || "unknown"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    logStep("Error creating checkout session", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
