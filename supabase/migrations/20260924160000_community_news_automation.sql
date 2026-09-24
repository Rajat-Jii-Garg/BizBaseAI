-- BizBase Community News Automation
-- Automated community posts are published through the community owner's account,
-- but are explicitly marked as automated and retain source metadata.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_automated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS automation_type TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS community_topic TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_automated_created_at
  ON public.posts(is_automated, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_name TEXT,
  headline TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, source_url)
);

CREATE INDEX IF NOT EXISTS idx_community_news_items_community_created
  ON public.community_news_items(community_id, created_at DESC);

ALTER TABLE public.community_news_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view community news items" ON public.community_news_items;
CREATE POLICY "Authenticated users can view community news items"
ON public.community_news_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = community_news_items.community_id
      AND (
        c.is_private = false
        OR c.user_id = auth.uid()
        OR public.is_community_member(c.id, auth.uid())
      )
  )
);

GRANT SELECT ON public.community_news_items TO authenticated;
GRANT ALL ON public.community_news_items TO service_role;

-- Service-role automation writes these rows. Normal users can never mark a post
-- as automated because their INSERT policy still requires auth.uid() = user_id;
-- the automation runner uses the service_role key and publishes on behalf of the
-- community owner.

-- Automated news posts should not mint user reward coins.
CREATE OR REPLACE FUNCTION public.handle_bizcoins_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND COALESCE(NEW.is_automated, false) = false THEN
    PERFORM public.award_bizcoins(NEW.user_id, 10);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_post ON public.posts;
CREATE TRIGGER trg_bizcoins_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_post();
