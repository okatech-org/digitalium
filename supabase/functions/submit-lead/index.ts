import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  company?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const leadData: LeadData = await req.json();

    // Validation
    if (!leadData.name || !leadData.email || !leadData.message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert lead into database
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: leadData.name,
        email: leadData.email,
        subject: leadData.subject || null,
        message: leadData.message,
        company: leadData.company || null,
        phone: leadData.phone || null,
        source: "contact_form",
        status: "new",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to save lead");
    }

    console.log("Lead saved successfully:", data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Votre message a été envoyé avec succès !",
        leadId: data.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Submit lead error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Une erreur s'est produite" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
