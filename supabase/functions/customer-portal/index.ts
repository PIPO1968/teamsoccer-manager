import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Check if STRIPE_SECRET_KEY is available
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

// Initialize Stripe with proper error handling
let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  } catch (error) {
    console.error(`[CUSTOMER-PORTAL] Failed to initialize Stripe: ${error.message}`);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function for logging
const logStep = (step: string, details?: any) => {
  console.log(`[CUSTOMER-PORTAL] ${step}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Since we're using one-time payments now, the customer portal is no longer needed
    // But we'll keep this endpoint for backwards compatibility and redirect to the shop page
    
    logStep("Customer portal function called - redirecting to shop page");
    
    const origin = req.headers.get("origin") || "";
    const shopUrl = `${origin}/shop`;
    
    return new Response(JSON.stringify({ url: shopUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Unexpected error", { message: error.message, stack: error.stack });
    
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred", 
      message: error.message,
      stack: error.stack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
