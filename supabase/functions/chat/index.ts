import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de DIGITALIUM, la première plateforme d'archivage intelligent multi-échelle gabonaise.

Ton rôle est d'aider les visiteurs à:
- Comprendre les fonctionnalités de DIGITALIUM (scan intelligent, IA assistant, archivage sécurisé)
- Répondre aux questions sur les tarifs (Gratuit: 1Go/100 docs, Personal: 2000 XAF/mois, Family: 5000 XAF/mois)
- Expliquer les avantages pour citoyens, PME et institutions
- Guider vers le formulaire de contact pour les demandes spécifiques

Règles de réponse:
- Réponds toujours en français
- Sois concis mais informatif (2-3 phrases max par réponse)
- Utilise un ton professionnel mais chaleureux
- Mentionne "Made in Gabon" et la souveraineté des données quand pertinent
- Si tu ne connais pas une info spécifique, redirige vers le formulaire de contact
- N'invente jamais de fonctionnalités qui n'existent pas

Services DIGITALIUM:
1. Scan Intelligent - Détection automatique du type de document, OCR avancé
2. Assistant IA - Chatbot qui aide à organiser, rechercher et gérer les documents
3. Sécurité Souveraine - Chiffrement AES-256, hébergement au Gabon
4. Multi-Persona - Adapté aux citoyens, PME et institutions
5. Mode Offline - Fonctionne sans internet
6. Workflows - Automatisation pour entreprises`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("API key not configured");
    }

    console.log("Calling AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
