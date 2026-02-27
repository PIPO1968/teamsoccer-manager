
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { username, email, password, country, team_name, agreed_to_terms } = await req.json();

    console.log('Creating user with data:', { username, email, country, team_name, agreed_to_terms });

    // Call the database function to create the manager
    const { data, error } = await supabase.rpc('create_new_manager', {
      p_username: username,
      p_email: email,
      p_password: password,
      p_country: country,
      p_team_name: team_name,
      p_agreed_to_terms: agreed_to_terms
    });

    if (error) {
      console.error('Database error:', error);
      // Return 200 status with error in body so client can handle it properly
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('User created successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
