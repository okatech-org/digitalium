import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

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

const ADMIN_EMAIL = "admin@digitalium.ma";

async function sendAdminNotification(leadData: LeadData, leadId: string) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email notification");
    return;
  }

  const resend = new Resend(resendApiKey);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6366f1; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 4px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .cta { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 Nouveau Lead Reçu !</h1>
          <p style="margin: 10px 0 0 0;">Un nouveau prospect vient de vous contacter</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">👤 Nom</div>
            <div class="value">${leadData.name}</div>
          </div>
          <div class="field">
            <div class="label">📧 Email</div>
            <div class="value">${leadData.email}</div>
          </div>
          ${leadData.phone ? `
          <div class="field">
            <div class="label">📱 Téléphone</div>
            <div class="value">${leadData.phone}</div>
          </div>
          ` : ''}
          ${leadData.company ? `
          <div class="field">
            <div class="label">🏢 Entreprise</div>
            <div class="value">${leadData.company}</div>
          </div>
          ` : ''}
          ${leadData.subject ? `
          <div class="field">
            <div class="label">📋 Sujet</div>
            <div class="value">${leadData.subject}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">💬 Message</div>
            <div class="value">${leadData.message}</div>
          </div>
          <p style="text-align: center;">
            <a href="#" class="cta">Voir dans le Dashboard</a>
          </p>
        </div>
        <div class="footer">
          <p>Lead ID: ${leadId}</p>
          <p>Digitalium - Votre partenaire digital</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Digitalium <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: `🔔 Nouveau Lead: ${leadData.name}${leadData.company ? ` - ${leadData.company}` : ''}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send admin notification:", error);
    } else {
      console.log("Admin notification sent successfully:", data?.id);
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
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

    // Send admin notification in background
    // Send admin notification (fire and forget)
    sendAdminNotification(leadData, data.id).catch(err => 
      console.error("Background notification failed:", err)
    );

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
