-- TRADE NOVA AI: private AI assistant conversation storage.
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (length(trim(content)) BETWEEN 1 AND 12000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_chat_messages_user_created_idx
  ON public.ai_chat_messages(user_id, created_at DESC);

ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own AI chat" ON public.ai_chat_messages;
CREATE POLICY "Users can read own AI chat" ON public.ai_chat_messages
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own AI chat" ON public.ai_chat_messages;
CREATE POLICY "Users can insert own AI chat" ON public.ai_chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'user');
REVOKE UPDATE, DELETE ON public.ai_chat_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.ai_chat_messages TO authenticated;
GRANT ALL ON public.ai_chat_messages TO service_role;

COMMENT ON TABLE public.ai_chat_messages IS 'Private conversation history for the TRADE NOVA AI assistant.';
