-- BizBase Communities Production V2
-- Owner membership, moderation, bans, reports, pins and hardened community permissions.

-- ------------------------------------------------------------
-- 1) Community moderation tables
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.community_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_community_bans_community
  ON public.community_bans(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_bans_user
  ON public.community_bans(user_id, community_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_community_status
  ON public.community_reports(community_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_pins_community
  ON public.community_pins(community_id, created_at DESC);

ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_pins ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2) Harden community helper functions
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_community_owner(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_community_banned(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.community_bans b
    WHERE b.community_id = p_community_id
      AND b.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_community_admin(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_community_owner(p_community_id, p_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = p_community_id
        AND cm.user_id = p_user_id
        AND cm.role = 'admin'
        AND cm.status = 'approved'
        AND NOT public.is_community_banned(p_community_id, p_user_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.is_community_moderator(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_community_owner(p_community_id, p_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = p_community_id
        AND cm.user_id = p_user_id
        AND cm.role IN ('admin', 'moderator')
        AND cm.status = 'approved'
        AND NOT public.is_community_banned(p_community_id, p_user_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.is_community_member(
  p_community_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (
      public.is_community_owner(p_community_id, p_user_id)
      OR EXISTS (
        SELECT 1
        FROM public.community_members cm
        WHERE cm.community_id = p_community_id
          AND cm.user_id = p_user_id
          AND cm.status = 'approved'
      )
    )
    AND NOT public.is_community_banned(p_community_id, p_user_id);
$$;

-- ------------------------------------------------------------
-- 3) Automatically make every creator an approved admin member.
-- This fixes creator visibility in My Communities and makes creation atomic.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_community_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.community_members (
    community_id,
    user_id,
    role,
    status,
    joined_at
  )
  VALUES (
    NEW.id,
    NEW.user_id,
    'admin',
    'approved',
    now()
  )
  ON CONFLICT (community_id, user_id)
  DO UPDATE SET
    role = 'admin',
    status = 'approved';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_community_owner_membership
  ON public.communities;

CREATE TRIGGER trg_ensure_community_owner_membership
AFTER INSERT ON public.communities
FOR EACH ROW
EXECUTE FUNCTION public.ensure_community_owner_membership();

-- Backfill existing owners safely.
INSERT INTO public.community_members (
  community_id,
  user_id,
  role,
  status,
  joined_at
)
SELECT
  c.id,
  c.user_id,
  'admin',
  'approved',
  COALESCE(c.created_at, now())
FROM public.communities c
ON CONFLICT (community_id, user_id)
DO UPDATE SET
  role = 'admin',
  status = 'approved';

-- Recalculate the authoritative count.
UPDATE public.communities c
SET members_count = (
  SELECT COUNT(*)
  FROM public.community_members cm
  WHERE cm.community_id = c.id
    AND cm.status = 'approved'
),
updated_at = now();

-- ------------------------------------------------------------
-- 4) Protect member roles/status transitions.
-- Only the owner can change roles. Admin/moderator can approve/reject/remove.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_community_member_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = (
    SELECT c.user_id
    FROM public.communities c
    WHERE c.id = OLD.community_id
  ) THEN
    IF NEW.user_id <> OLD.user_id
       OR NEW.community_id <> OLD.community_id
       OR NEW.role <> 'admin'
       OR NEW.status <> 'approved' THEN
      RAISE EXCEPTION 'Community owner membership cannot be changed';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     AND NOT public.is_community_owner(OLD.community_id, auth.uid()) THEN
    RAISE EXCEPTION 'Only the community owner can change member roles';
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.community_id IS DISTINCT FROM OLD.community_id THEN
    RAISE EXCEPTION 'Member identity cannot be changed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_community_member_changes
  ON public.community_members;

CREATE TRIGGER trg_protect_community_member_changes
BEFORE UPDATE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.protect_community_member_changes();

CREATE OR REPLACE FUNCTION public.protect_community_member_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = (
    SELECT c.user_id FROM public.communities c WHERE c.id = OLD.community_id
  ) THEN
    RAISE EXCEPTION 'Community owner membership cannot be removed';
  END IF;

  IF OLD.role IN ('admin', 'moderator')
     AND NOT public.is_community_owner(OLD.community_id, auth.uid()) THEN
    RAISE EXCEPTION 'Only the community owner can remove an admin or moderator';
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_community_member_delete
  ON public.community_members;

CREATE TRIGGER trg_protect_community_member_delete
BEFORE DELETE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.protect_community_member_delete();

DROP POLICY IF EXISTS "Users can view posts" ON public.posts;
CREATE POLICY "Users can view posts"
ON public.posts
FOR SELECT
USING (
  community_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = posts.community_id
      AND (
        c.is_private = false
        OR public.is_community_member(c.id, auth.uid())
      )
  )
);

-- ------------------------------------------------------------
-- 5) Ban enforcement for membership and community posts.
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
CREATE POLICY "Users can join communities"
ON public.community_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND NOT public.is_community_banned(community_id, auth.uid())
  AND (
    (
      status = 'approved'
      AND EXISTS (
        SELECT 1
        FROM public.communities c
        WHERE c.id = community_members.community_id
          AND (
            c.is_private = false
            OR c.user_id = auth.uid()
          )
      )
    )
    OR (
      status = 'pending'
      AND EXISTS (
        SELECT 1
        FROM public.communities c
        WHERE c.id = community_members.community_id
          AND c.is_private = true
          AND c.user_id <> auth.uid()
      )
    )
  )
);

DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    community_id IS NULL
    OR (
      public.is_community_member(community_id, auth.uid())
      AND NOT public.is_community_banned(community_id, auth.uid())
    )
  )
);

-- ------------------------------------------------------------
-- 6) Moderation: bans
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Community admins can view bans" ON public.community_bans;
CREATE POLICY "Community admins can view bans"
ON public.community_bans
FOR SELECT
USING (public.is_community_moderator(community_id, auth.uid()));

DROP POLICY IF EXISTS "Community admins can create bans" ON public.community_bans;
CREATE POLICY "Community admins can create bans"
ON public.community_bans
FOR INSERT
WITH CHECK (
  public.is_community_moderator(community_id, auth.uid())
  AND user_id <> auth.uid()
  AND NOT public.is_community_owner(community_id, user_id)
  AND (
    public.is_community_owner(community_id, auth.uid())
    OR NOT EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = community_bans.community_id
        AND cm.user_id = community_bans.user_id
        AND cm.role IN ('admin', 'moderator')
        AND cm.status = 'approved'
    )
  )
  AND banned_by = auth.uid()
);

DROP POLICY IF EXISTS "Community admins can remove bans" ON public.community_bans;
CREATE POLICY "Community admins can remove bans"
ON public.community_bans
FOR DELETE
USING (public.is_community_owner(community_id, auth.uid())
  OR public.is_community_admin(community_id, auth.uid()));

-- ------------------------------------------------------------
-- 7) Moderation: reports
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Members can create community reports" ON public.community_reports;
CREATE POLICY "Members can create community reports"
ON public.community_reports
FOR INSERT
WITH CHECK (
  auth.uid() = reported_by
  AND public.is_community_member(community_id, auth.uid())
  AND (
    post_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND p.community_id = community_reports.community_id
    )
  )
);

DROP POLICY IF EXISTS "Moderators can view community reports" ON public.community_reports;
CREATE POLICY "Moderators can view community reports"
ON public.community_reports
FOR SELECT
USING (public.is_community_moderator(community_id, auth.uid()));

DROP POLICY IF EXISTS "Moderators can update community reports" ON public.community_reports;
CREATE POLICY "Moderators can update community reports"
ON public.community_reports
FOR UPDATE
USING (public.is_community_moderator(community_id, auth.uid()))
WITH CHECK (
  status IN ('open', 'reviewing', 'resolved', 'dismissed')
  AND reviewed_by = auth.uid()
);

-- ------------------------------------------------------------
-- 8) Moderation: pinned posts
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view pinned posts" ON public.community_pins;
CREATE POLICY "Members can view pinned posts"
ON public.community_pins
FOR SELECT
USING (public.is_community_member(community_id, auth.uid()));

DROP POLICY IF EXISTS "Moderators can pin posts" ON public.community_pins;

CREATE POLICY "Moderators can pin posts"
ON public.community_pins
FOR INSERT
WITH CHECK (
  public.is_community_moderator(community_pins.community_id, auth.uid())
  AND community_pins.pinned_by = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = community_pins.post_id
      AND p.community_id = community_pins.community_id
  )
);

DROP POLICY IF EXISTS "Moderators can unpin posts" ON public.community_pins;
CREATE POLICY "Moderators can unpin posts"
ON public.community_pins
FOR DELETE
USING (public.is_community_moderator(community_id, auth.uid()));

-- ------------------------------------------------------------
-- 9) Secure community post deletion for moderators.
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (
  auth.uid() = user_id
  OR (
    community_id IS NOT NULL
    AND public.is_community_moderator(community_id, auth.uid())
  )
);

-- ------------------------------------------------------------
-- 10) Realtime support for moderation tables.
-- ------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_members;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_bans'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_bans;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_reports'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reports;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'community_pins'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_pins;
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_bans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.community_reports TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.community_pins TO authenticated;
GRANT ALL ON public.community_bans TO service_role;
GRANT ALL ON public.community_reports TO service_role;
GRANT ALL ON public.community_pins TO service_role;
