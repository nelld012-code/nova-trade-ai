import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function notifyTelegram(user: { id: string; email?: string | null }, content: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!botToken || !chatId) return;
  const text = ["🔔 TRADE NOVA AI — Nuevo mensaje", "", `👤 Usuario: ${user.email || "Sin email"}`, `🆔 ID: ${user.id}`, `💬 ${content.slice(0, 3500)}`].join("\n");
  try { await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }) }); } catch { /* notification is best-effort */ }
}

async function persistAssistantMessage(url: string, key: string | undefined, userId: string, content: string) {
  if (!key) return;
  try { await fetch(`${url}/rest/v1/ai_chat_messages`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ user_id: userId, role: "assistant", content: content.slice(0, 12000) }) }); } catch { /* persistence is best-effort */ }
}

async function loadTradingContext(url: string, key: string, userId: string) {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  async function get(path: string) { const r = await fetch(`${url}/rest/v1/${path}`, { headers }); return r.ok ? await r.json() : []; }
  const [portfolio, risk, robot, operations] = await Promise.all([
    get(`portfolio?select=balance,invested,performance_pct,today_pnl,total_deposited,total_pnl&user_id=eq.${userId}&limit=1`),
    get(`risk_controls?select=max_position_usd,max_daily_loss_usd,max_open_positions,max_drawdown_pct,kill_switch&user_id=eq.${userId}&limit=1`),
    get(`robots?select=status,mode,risk_level,capital_allocation,markets&user_id=eq.${userId}&limit=1`),
    get(`operations?select=asset,direction,entry_price,exit_price,pnl,return_pct,size,status,opened_at,closed_at&user_id=eq.${userId}&order=created_at.desc&limit=8`),
  ]);
  return { portfolio: portfolio[0] ?? null, risk: risk[0] ?? null, robot: robot[0] ?? null, recent_operations: operations };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const auth = req.headers.get("Authorization"); if (!auth) throw new Error("Unauthorized");
    const supabaseUrl = Deno.env.get("SUPABASE_URL"); const anonKey = Deno.env.get("SUPABASE_ANON_KEY"); const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !anonKey) throw new Error("Supabase configuration is missing"); if (!openaiKey) throw new Error("AI provider is not configured");
    const verify = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { Authorization: auth, apikey: anonKey } }); if (!verify.ok) throw new Error("Unauthorized");
    const user = await verify.json(); if (!user?.id) throw new Error("Unauthorized");
    const body = await req.json(); const messages = Array.isArray(body?.messages) ? body.messages.slice(-20) : []; if (!messages.length) throw new Error("No messages provided");
    const latest = [...messages].reverse().find((m: { role?: string }) => m?.role === "user"); if (latest?.content) await notifyTelegram(user, String(latest.content));
    const context = serviceRoleKey ? await loadTradingContext(supabaseUrl, serviceRoleKey, user.id) : null;
    const system = `You are NOVA AI, the assistant inside TRADE NOVA AI. Be concise, professional and helpful. Explain trading concepts, portfolio metrics, risk management and the DEMO platform. You may use the private account context below to answer questions about the user's account, but never expose internal IDs, secrets, service keys or another user's data. Never promise profits, never present DEMO data as real market data, and never claim to execute a real trade. LIVE trading is disabled. You cannot place, withdraw or transfer money. If a value is missing, say so instead of inventing it. Distinguish DEMO from real-market data. Respond in the user's language when possible.\n\nPRIVATE USER CONTEXT (trusted server data):\n${JSON.stringify(context)}`;
    const upstream = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: Deno.env.get("OPENAI_MODEL") || "gpt-5-mini", input: [{ role: "system", content: system }, ...messages.map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 12000) }))], max_output_tokens: 900 }) });
    const data = await upstream.json(); if (!upstream.ok) throw new Error(data?.error?.message || "AI provider error");
    const output = data?.output_text || data?.output?.flatMap((item: any) => item?.content || []).find((c: any) => c?.text)?.text || "No response generated.";
    await persistAssistantMessage(supabaseUrl, serviceRoleKey, user.id, output);
    return new Response(JSON.stringify({ content: output }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
