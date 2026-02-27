
import Stripe from "https://esm.sh/stripe@12.5.0";
import { corsHeaders, logStep, createSupabaseClient } from "./utils.ts";

// Initialize Stripe client
const createStripeClient = () => {
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
  
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Missing Stripe secret key");
  }
  
  return { 
    stripe: new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }),
    webhookSecret: STRIPE_WEBHOOK_SECRET
  };
};

export const handleStripeEvent = async (body: string, signature: string) => {
  const { stripe, webhookSecret } = createStripeClient();
  const supabase = createSupabaseClient();
  
  let event;
  
  // Verify the webhook signature
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event constructed successfully", { type: event.type });
  } catch (err) {
    logStep("Error verifying webhook signature", { error: err.message });
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Handle specific Stripe events
  switch (event.type) {
    case "checkout.session.completed": {
      return await handleCheckoutSessionCompleted(event.data.object, supabase);
    }
    
    default: {
      logStep("Unhandled event type", { type: event.type });
      return new Response(JSON.stringify({ received: true, eventType: event.type, status: "unhandled" }), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
  }
};

const handleCheckoutSessionCompleted = async (session: any, supabase: any) => {
  const userId = session.client_reference_id;
  const paymentStatus = session.payment_status;
  const premiumExpiresAt = session.metadata?.premium_expires_at;
  
  logStep("Checkout session completed", { 
    userId, 
    paymentStatus, 
    premiumExpiresAt 
  });

  if (userId && paymentStatus === "paid" && premiumExpiresAt) {
    // Update managers table with premium status
    const { error: managersError } = await supabase
      .from("managers")
      .update({
        is_premium: 1,
        premium_expires_at: premiumExpiresAt
      })
      .eq("user_id", userId);

    if (managersError) {
      logStep("Error updating managers", managersError);
      return new Response(JSON.stringify({ error: "Failed to update manager" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    logStep("Manager record updated successfully");
  } else {
    logStep("Missing required data in session", { userId, paymentStatus, premiumExpiresAt });
    return new Response(JSON.stringify({ error: "Missing required data in session" }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ received: true }), { 
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
};
