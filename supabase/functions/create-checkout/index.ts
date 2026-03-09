
import { serve } from "https://deno.land/std@0.203.0/http/mod.ts";
// import Stripe from "https://deno.land/x/stripe@v12.5.0/mod.ts";
import Stripe from "npm:stripe@12.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${step}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    logStep("Function started");

    // Get Stripe secret key from environment
    const STRIPE_SECRET_KEY = (globalThis as any).process?.env?.STRIPE_SECRET_KEY ?? undefined;
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
      let errorMessage = "Unknown error";
      let errorType = "unknown";
      let errorCode = "unknown";
      if (stripeError && typeof stripeError === "object") {
        if ("message" in stripeError && typeof (stripeError as any).message === "string") {
          errorMessage = (stripeError as any).message;
        }
        if ("type" in stripeError && typeof (stripeError as any).type === "string") {
          errorType = (stripeError as any).type;
        }
        if ("code" in stripeError && typeof (stripeError as any).code === "string") {
          errorCode = (stripeError as any).code;
        }
      }

      logStep("Stripe API error", {
        error: errorMessage,
        type: errorType,
        code: errorCode
      });

      return new Response(JSON.stringify({
        error: errorMessage,
        type: "stripe_error",
        code: errorCode
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error) {
    const errorMessage = (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string")
      ? (error as any).message
      : String(error);
    logStep("Error creating checkout session", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
