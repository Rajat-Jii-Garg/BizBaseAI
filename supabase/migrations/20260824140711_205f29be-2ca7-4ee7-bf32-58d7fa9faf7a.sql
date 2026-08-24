-- 1. FOUNDER PROFILES
CREATE TABLE public.founder_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  startup_name text NOT NULL,
  tagline text,
  website text,
  stage text NOT NULL DEFAULT 'idea',
  industry text,
  city text,
  team_size text,
  funding_stage text,
  looking_for text[] NOT NULL DEFAULT '{}',
  is_hiring boolean NOT NULL DEFAULT false,
  pitch text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.founder_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_profiles TO authenticated;
GRANT ALL ON public.founder_profiles TO service_role;

ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder profiles are publicly viewable"
  ON public.founder_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own founder profile"
  ON public.founder_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own founder profile"
  ON public.founder_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own founder profile"
  ON public.founder_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_founder_profiles_updated_at
  BEFORE UPDATE ON public.founder_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. FOUNDER ASKS
CREATE TABLE public.founder_asks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'advice',
  title text NOT NULL,
  description text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  city text,
  status text NOT NULL DEFAULT 'open',
  responses_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.founder_asks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_asks TO authenticated;
GRANT ALL ON public.founder_asks TO service_role;

ALTER TABLE public.founder_asks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder asks are publicly viewable"
  ON public.founder_asks FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own asks"
  ON public.founder_asks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asks"
  ON public.founder_asks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own asks"
  ON public.founder_asks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_founder_asks_created ON public.founder_asks (created_at DESC);
CREATE INDEX idx_founder_asks_kind ON public.founder_asks (kind);

CREATE TRIGGER update_founder_asks_updated_at
  BEFORE UPDATE ON public.founder_asks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. RESPONSES
CREATE TABLE public.founder_ask_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ask_id uuid NOT NULL REFERENCES public.founder_asks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_ask_responses TO authenticated;
GRANT ALL ON public.founder_ask_responses TO service_role;

ALTER TABLE public.founder_ask_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ask owner and responder can view responses"
  ON public.founder_ask_responses FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.founder_asks a
      WHERE a.id = founder_ask_responses.ask_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can respond to asks"
  ON public.founder_ask_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON public.founder_ask_responses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON public.founder_ask_responses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_founder_ask_responses_ask ON public.founder_ask_responses (ask_id);

CREATE TRIGGER update_founder_ask_responses_updated_at
  BEFORE UPDATE ON public.founder_ask_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep responses_count in sync + notify ask owner
CREATE OR REPLACE FUNCTION public.handle_founder_ask_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  owner_id uuid;
  ask_title text;
  responder_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.founder_asks
      SET responses_count = responses_count + 1
      WHERE id = NEW.ask_id
      RETURNING user_id, title INTO owner_id, ask_title;

    SELECT full_name INTO responder_name FROM public.profiles WHERE id = NEW.user_id;

    IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
      PERFORM public.create_notification(
        owner_id,
        'founder_ask',
        COALESCE(responder_name, 'Someone') || ' responded to your ask',
        COALESCE(responder_name, 'Someone') || ' replied to "' || COALESCE(ask_title, 'your ask') || '".',
        NULL,
        NEW.user_id
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.founder_asks
      SET responses_count = GREATEST(0, responses_count - 1)
      WHERE id = OLD.ask_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_founder_ask_response
  AFTER INSERT OR DELETE ON public.founder_ask_responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_founder_ask_response();

-- Reward BizCoins for founder activity
CREATE OR REPLACE FUNCTION public.handle_bizcoins_founder_ask()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN PERFORM public.award_bizcoins(NEW.user_id, 0.75); END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bizcoins_founder_ask
  AFTER INSERT ON public.founder_asks
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_founder_ask();