import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !anonKey) throw new Error("Supabase configuration is missing");
    if (!openaiKey) throw new Error("AI provider is not configured");

    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: auth, apikey: anonKey } });
    if (!verify.ok) throw new Error("Unauthorized");
    const user = await verify.json();
    if (!user?.id) throw new Error("Unauthorized");

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) throw new Error("No messages provided");

    const system = `You are NOVA AI, the assistant inside TRADE NOVA AI. Be concise, professional and helpful. Explain trading concepts, portfolio metrics, risk management and the DEMO platform. Never promise profits, never present DEMO data as real market data, and never claim to execute a real trade. LIVE trading is disabled. If asked to place, withdraw or transfer money, explain that the assistant cannot perform those actions. Respond in the user's language when possible.`;
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") || "gpt-5-mini", input: [{ role: "system", content: system }, ...messages.map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 12000) }))], max_output_tokens: 900 }),
    });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.error?.message || "AI provider error");
    const output = data?.output_text || data?.output?.flatMap((item: any) => item?.content || []).find((c: any) => c?.text)?.text || "No response generated.";
    return new Response(JSON.stringify({ content: output }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
