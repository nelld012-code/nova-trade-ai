# TRADE NOVA AI — Operations Runbook

## Current execution boundary

TRADE NOVA AI currently separates DEMO execution from future LIVE execution. The server-side trading gate keeps LIVE disabled. Do not enable LIVE merely by changing frontend state.

## Supabase secrets required for NOVA AI + Telegram

Configure these as Supabase Edge Function secrets, never in the frontend:

- `OPENAI_API_KEY` — required for AI replies.
- `OPENAI_MODEL` — optional model override; the function has a safe code default.
- `SUPABASE_SERVICE_ROLE_KEY` — required for server-side assistant persistence and private account context.
- `TELEGRAM_BOT_TOKEN` — optional until Telegram is configured.
- `TELEGRAM_CHAT_ID` — optional until Telegram is configured.

Never commit these values to GitHub.

## Telegram behavior

Each completed NOVA AI exchange can be sent to the configured Telegram chat. Messages are chunked below Telegram's message-size limit. Telegram delivery is best-effort: a Telegram outage must not make the user's chat fail.

## Database migrations

All schema/security changes live under `supabase/migrations/` and must be applied through the project's normal Supabase migration workflow. Repository commits alone do not apply migrations to the hosted database.

Important recent areas:

- protected admin portfolio updates and audit trail
- deposit/withdrawal review RPCs
- per-user risk controls and kill switch
- DEMO market state/equity history
- private NOVA AI chat history
- admin support RPCs
- automatic DEMO risk-alert trigger

## Admin console

`/dashboard/admin` contains user/role management, portfolio controls, finance review, risk controls, audit log and support tools. Privileged operations are server-side RPCs with admin-role checks.

## Safety rules

- Never fabricate balances, P&L, deposits, withdrawals or historical performance.
- Never expose service-role keys or internal credentials to clients.
- Never represent DEMO prices/results as live market data.
- Never promise profitability.
- Never claim a real trade was executed while LIVE trading is disabled.
- Before enabling LIVE, add a dedicated broker/exchange execution layer, server-side authorization, reconciliation, idempotency, monitoring, rate limiting, compliance controls and independent testing.
