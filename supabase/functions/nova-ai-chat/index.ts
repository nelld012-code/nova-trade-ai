import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json"}})}
async function notifyTelegram(user:{id:string;email?:string|null},userMessage:string,assistantMessage:string){const botToken=Deno.env.get("TELEGRAM_BOT_TOKEN");const chatId=Deno.env.get("TELEGRAM_CHAT_ID");if(!botToken||!chatId)return;const full=["🔔 TRADE NOVA AI — Conversación","",`👤 Usuario: ${user.email||"Sin email"}`,`🆔 ID: ${user.id}`,"",`👤 Usuario:\n${userMessage}`,"",`🤖 NOVA AI:\n${assistantMessage}`].join("\n");const chunks=full.match(/[\s\S]{1,3900}/g)||[];try{for(const text of chunks){await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})})}}catch{/* best effort: Telegram must never break the chat */}}
async function persistAssistantMessage(url:string,key:string|undefined,userId:string,content:string){if(!key)return;try{await fetch(`${url}/rest/v1/ai_chat_messages`,{method:"POST",headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({user_id:userId,role:"assistant",content:content.slice(0,12000)})})}catch{/* best effort */}}
async function loadTradingContext(url:string,key:string,userId:string){const headers={apikey:key,Authorization:`Bearer ${key}`};async function get(path:string){try{const r=await fetch(`${url}/rest/v1/${path}`,{headers});return r.ok?await r.json():[]}catch{return[]}}const[portfolio,risk,robot,operations]=await Promise.all([get(`portfolio?select=balance,invested,performance_pct,today_pnl,total_deposited,total_pnl&user_id=eq.${userId}&limit=1`),get(`risk_controls?select=max_position_usd,max_daily_loss_usd,max_open_positions,max_drawdown_pct,kill_switch&user_id=eq.${userId}&limit=1`),get(`robots?select=status,mode,risk_level,capital_allocation,markets&user_id=eq.${userId}&limit=1`),get(`operations?select=asset,direction,entry_price,exit_price,pnl,return_pct,size,status,opened_at,closed_at&user_id=eq.${userId}&order=created_at.desc&limit=8`)]);return{portfolio:portfolio[0]??null,risk:risk[0]??null,robot:robot[0]??null,recent_operations:operations}}

type ChatMessage={role:"system"|"user"|"assistant";content:string};
type ProviderResult={content:string}|{error:string;status:number};

/** Primary provider: Lovable AI Gateway (OpenAI-compatible chat completions). */
async function askLovableGateway(key:string,messages:ChatMessage[]):Promise<ProviderResult>{
  const model=Deno.env.get("LOVABLE_AI_MODEL")||"google/gemini-3-flash";
  const r=await fetch("https://ai.gateway.lovable.dev/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,messages,max_tokens:900})});
  if(r.status===429)return{error:"rate_limited",status:429};
  if(r.status===402)return{error:"payment_required",status:402};
  const data=await r.json().catch(()=>null);
  if(!r.ok)return{error:data?.error?.message||`Gateway error ${r.status}`,status:r.status};
  const content=data?.choices?.[0]?.message?.content;
  return typeof content==="string"&&content.trim()?{content}:{error:"empty_response",status:502};
}

/** Fallback provider: OpenAI Responses API. */
async function askOpenAI(key:string,messages:ChatMessage[]):Promise<ProviderResult>{
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")||"gpt-5-mini",input:messages,max_output_tokens:900})});
  const data=await r.json().catch(()=>null);
  if(!r.ok)return{error:data?.error?.message||`OpenAI error ${r.status}`,status:r.status};
  // deno-lint-ignore no-explicit-any
  const content=data?.output_text||data?.output?.flatMap((item:any)=>item?.content||[]).find((c:any)=>c?.text)?.text;
  return typeof content==="string"&&content.trim()?{content}:{error:"empty_response",status:502};
}

function userFacingProviderError(code:string){
  if(code==="rate_limited")return"NOVA AI is receiving too many requests. Please try again in a moment.";
  if(code==="payment_required")return"NOVA AI credits are exhausted. Please contact the administrator.";
  return"NOVA AI cannot answer right now. Please try again shortly.";
}

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST")return json({error:"Method not allowed"},405);
  try{
    const auth=req.headers.get("Authorization");if(!auth)return json({error:"Unauthorized"},401);
    const supabaseUrl=Deno.env.get("SUPABASE_URL"),anonKey=Deno.env.get("SUPABASE_ANON_KEY"),serviceRoleKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lovableKey=Deno.env.get("LOVABLE_API_KEY"),openaiKey=Deno.env.get("OPENAI_API_KEY");
    if(!supabaseUrl||!anonKey)return json({error:"Backend configuration is missing"},500);
    if(!lovableKey&&!openaiKey)return json({error:"AI provider is not configured"},500);
    const verify=await fetch(`${supabaseUrl}/auth/v1/user`,{headers:{Authorization:auth,apikey:anonKey}});
    if(!verify.ok)return json({error:"Unauthorized"},401);
    const user=await verify.json();if(!user?.id)return json({error:"Unauthorized"},401);
    const body=await req.json().catch(()=>null);
    const messages=Array.isArray(body?.messages)?body.messages.slice(-20):[];
    if(!messages.length)return json({error:"No messages provided"},400);
    const normalized:ChatMessage[]=messages.map((m:{role?:string;content?:unknown})=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content??"").slice(0,4000)} as ChatMessage)).filter((m:ChatMessage)=>m.content.trim().length>0);
    if(!normalized.length)return json({error:"No valid messages provided"},400);
    const latest=[...normalized].reverse().find(m=>m.role==="user");const userMessage=String(latest?.content||"");
    if(!userMessage)return json({error:"User message required"},400);
    const context=serviceRoleKey?await loadTradingContext(supabaseUrl,serviceRoleKey,user.id):null;
    const system=`You are NOVA AI, the assistant inside TRADE NOVA AI. Be concise, professional and helpful. Explain trading concepts, portfolio metrics, risk management and the DEMO platform. You may use the private account context below to answer questions about the user's account, but never expose internal IDs, secrets, service keys or another user's data. Never promise profits, never present DEMO data as real market data, and never claim to execute a real trade. LIVE trading is disabled. You cannot place, withdraw or transfer money. If a value is missing, say so instead of inventing it. Distinguish DEMO from real-market data. Respond in the user's language when possible.\n\nPRIVATE USER CONTEXT (trusted server data):\n${JSON.stringify(context)}`;
    const conversation:ChatMessage[]=[{role:"system",content:system},...normalized];
    let result:ProviderResult|null=null;
    if(lovableKey){result=await askLovableGateway(lovableKey,conversation);if("error"in result)console.error("nova-ai-chat: Lovable gateway failed",result.status,result.error)}
    if((!result||"error"in result)&&openaiKey){const fb=await askOpenAI(openaiKey,conversation);if("error"in fb)console.error("nova-ai-chat: OpenAI fallback failed",fb.status,fb.error);if(!result||!("error"in fb))result=fb}
    if(!result||"error"in result){const code=result&&"error"in result?result.error:"unavailable";const status=result&&"error"in result&&(result.status===429||result.status===402)?result.status:502;return json({error:userFacingProviderError(code)},status)}
    const output=result.content;
    await persistAssistantMessage(supabaseUrl,serviceRoleKey,user.id,output);
    await notifyTelegram(user,userMessage,output);
    return json({content:output});
  }catch(error){console.error("nova-ai-chat: unexpected error",error);return json({error:"Unexpected error"},500)}
});
