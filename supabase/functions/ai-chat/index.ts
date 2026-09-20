import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple in-memory rate limiter (per user, per instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30; // 30 requests
const RATE_WINDOW_MS = 60_000; // per minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (isRateLimited(userData.user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, mode } = await req.json();

    if (!message || typeof message !== 'string' || message.length > 4000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    
    if (mode === 'business-growth') {
      systemPrompt = `You are BizBase Growth Operator. Create practical marketing and growth plans for a real business.
STRICT RULES:
- Use only the supplied business context; never invent business metrics, customers, channels, or results.
- Return valid JSON only. No markdown.
- JSON shape: {"summary":string,"priority":string,"days":[{"day":string,"focus":string,"action":string,"cta":string}],"measurement":string}.
- Keep actions small enough for a founder or small team to execute.
- Do not promise guaranteed leads or revenue.
Business context: ${context || 'No business context supplied'}`;
    } else if (mode === 'business-operator') {
      systemPrompt = `You are BizBase Business Operator. Answer questions about the user's business using only the supplied live context.
STRICT RULES:
- Never invent numbers or claim an action was completed.
- Distinguish observed data from recommendations.
- Give the most useful next action first.
- Keep the response concise and practical.
Business context: ${context || 'No live business context supplied'}`;
    } else if (mode === 'career-coach') {
      systemPrompt = `You are BizAI Career Coach on BizBase platform.

STRICT RULES:
- ONLY answer what the user asked. Do NOT add extra tips, suggestions, or unsolicited advice.
- Be direct and to the point. No filler or fluff.
- If the user asks one question, give one focused answer.
- Do NOT list multiple tips unless the user specifically asks for tips or a list.
- Keep responses short and precise.

Context about user (use only if relevant to their question): ${context || 'Professional user'}`;
    } else {
      systemPrompt = `You are BizAI, a professional AI assistant on BizBase networking platform.

STRICT RULES:
- ONLY answer what the user asked. Do NOT volunteer extra information or unsolicited advice.
- Be direct, concise, and focused on the exact question.
- If the user asks one thing, answer that one thing only.
- Do NOT add "bonus tips", "also consider", or any unrequested suggestions.
- Keep responses short unless the user asks for detail.

Context about user (use only if relevant to their question): ${context || 'Professional user'}`;
    }

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
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: 'Request failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
