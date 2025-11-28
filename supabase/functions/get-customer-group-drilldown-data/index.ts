import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      p_start_date,
      p_end_date,
      p_exclude_employees,
      p_supervisors,
      p_sellers,
      p_customer_groups,
      p_regions,
      p_clients,
      p_search_term,
      p_drilldown_level,
      p_parent_keys,
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabaseClient.rpc(
      "get_customer_group_drilldown_data",
      {
        p_start_date,
        p_end_date,
        p_exclude_employees,
        p_supervisors,
        p_sellers,
        p_customer_groups,
        p_regions,
        p_clients,
        p_search_term,
        p_drilldown_level,
        p_parent_keys,
      }
    );

    if (error) {
      console.error("RPC Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Request Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});