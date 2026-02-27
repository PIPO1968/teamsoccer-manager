
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleStripeEvent } from "./eventHandler.ts";
import { corsHeaders, logStep } from "./utils.ts";

serve(async (req) => {
  logStep("Webhook request received");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the signature from the headers
  const signature = req.headers.get("stripe-signature");
  
  // Webhooks don't need authorization header, they use the stripe-signature header
  if (!signature) {
    logStep("Error", "No Stripe signature provided");
    return new Response(JSON.stringify({ error: "No Stripe signature provided" }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  
  logStep("Signature found", { signature: signature.substring(0, 20) + "..." });

  try {
    const body = await req.text();
    logStep("Request body received", { bodyLength: body.length });
    
    return await handleStripeEvent(body, signature);
  } catch (error) {
    logStep("Unexpected error", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
