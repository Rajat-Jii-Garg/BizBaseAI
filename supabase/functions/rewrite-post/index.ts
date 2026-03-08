import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, tone } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const toneInstructions: Record<string, string> = {
      professional: "Rewrite in a polished, professional LinkedIn-style tone. Use strong action words and industry-relevant language.",
      warm: "Rewrite in a warm, friendly, and approachable tone while keeping it professional. Make it feel personal and engaging.",
      calm: "Rewrite in a calm, thoughtful, and measured tone. Focus on clarity and wisdom.",
      bold: "Rewrite in a bold, confident, and impactful tone. Make it stand out and grab attention.",
      casual: "Rewrite in a casual, conversational tone while keeping the core message. Make it relatable and easy to read.",
    };

    const systemPrompt = `You are a professional content writer for a business networking platform called BizBase. Your job is to rewrite user posts to make them more engaging and impactful.

Instructions:
- ${toneInstructions[tone] || toneInstructions.professional}
- Keep the core message and intent intact.
- Maintain any hashtags (#) and mentions (@) from the original.
- Keep the response concise (similar length to original, max 280 chars for short posts, up to 500 for longer ones).
- Do NOT add quotes around the text.
- Do NOT add any prefix like "Here's..." or explanations.
- Just return the rewritten post text directly.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Rewrite this post:\n\n${content}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      throw new Error('No response from AI');
    }

    return new Response(JSON.stringify({ rewritten }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rewrite-post function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
