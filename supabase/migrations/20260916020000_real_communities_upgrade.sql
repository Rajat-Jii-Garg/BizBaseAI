-- Real BizBase Communities upgrade
-- Adds approval-aware memberships and real community-scoped posts.

ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';

UPDATE public.community_members
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE public.community_members
  DROP CONSTRAINT IF EXISTS community_members_status_check;

ALTER TABLE public.community_members
  ADD CONSTRAINT community_members_status_check
  CHECK (status IN ('pending', 'approved'));

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_community_members_community_status
  ON public.community_members(community_id, status);

CREATE INDEX IF NOT EXISTS idx_community_members_user_community
  ON public.community_members(user_id, community_id);

CREATE INDEX IF NOT EXISTS idx_posts_community_created_at
  ON public.posts(community_id, created_at DESC);

-- SECURITY DEFINER helper avoids recursive RLS checks when an admin/moderator
-- needs to review or manage community members.
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
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.user_id = p_user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.community_members cm
    WHERE cm.community_id = p_community_id
      AND cm.user_id = p_user_id
      AND cm.role IN ('admin', 'moderator')
      AND cm.status = 'approved'
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
  SELECT EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = p_community_id
      AND c.user_id = p_user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.community_members cm
    WHERE cm.community_id = p_community_id
      AND cm.user_id = p_user_id
      AND cm.status = 'approved'
  );
$$;

-- Community visibility: public communities are discoverable by everyone;
-- private communities expose their directory metadata only to authenticated users.
DROP POLICY IF EXISTS "Anyone can view public communities" ON public.communities;
DROP POLICY IF EXISTS "Authenticated users can view communities" ON public.communities;
CREATE POLICY "Anyone can view public communities"
ON public.communities
FOR SELECT
USING (NOT is_private OR auth.uid() IS NOT NULL);

-- Members: approved memberships are visible, and a user can always see their own
-- pending membership. Community admins/owners can see pending requests.
DROP POLICY IF EXISTS "Users can view community members" ON public.community_members;
CREATE POLICY "Users can view community members"
ON public.community_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_community_admin(community_members.community_id, auth.uid())
  OR (
    status = 'approved'
    AND EXISTS (
      SELECT 1
      FROM public.communities c
      WHERE c.id = community_members.community_id
        AND (
          c.is_private = false
          OR public.is_community_member(c.id, auth.uid())
        )
    )
  )
);

-- Joining rules:
-- Public community -> approved immediately.
-- Private community -> pending request.
-- Community owner -> approved admin membership.
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
CREATE POLICY "Users can join communities"
ON public.community_members
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    (
      status = 'approved'
      AND EXISTS (
        SELECT 1
        FROM public.communities c
        WHERE c.id = community_members.community_id
          AND (c.is_private = false OR c.user_id = auth.uid())
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

-- Users may leave/delete their own membership. Admins may also remove members.
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
CREATE POLICY "Users can leave communities"
ON public.community_members
FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = community_members.community_id
      AND c.user_id = auth.uid()
  )
  OR public.is_community_admin(community_members.community_id, auth.uid())
);

DROP POLICY IF EXISTS "Community admins can update members" ON public.community_members;
CREATE POLICY "Community admins can update members"
ON public.community_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.communities c
    WHERE c.id = community_members.community_id
      AND c.user_id = auth.uid()
  )
  OR public.is_community_admin(community_members.community_id, auth.uid())
)
WITH CHECK (status IN ('pending', 'approved'));

-- Replace the member-count trigger so pending private requests never count as members.
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'approved' THEN
      UPDATE public.communities
      SET members_count = GREATEST(COALESCE(members_count, 0) + 1, 0),
          updated_at = now()
      WHERE id = NEW.community_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'approved' THEN
      UPDATE public.communities
      SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0),
          updated_at = now()
      WHERE id = OLD.community_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> 'approved' AND NEW.status = 'approved' THEN
      UPDATE public.communities
      SET members_count = GREATEST(COALESCE(members_count, 0) + 1, 0),
          updated_at = now()
      WHERE id = NEW.community_id;
    ELSIF OLD.status = 'approved' AND NEW.status <> 'approved' THEN
      UPDATE public.communities
      SET members_count = GREATEST(COALESCE(members_count, 0) - 1, 0),
          updated_at = now()
      WHERE id = NEW.community_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_community_member_count_trigger ON public.community_members;
CREATE TRIGGER update_community_member_count_trigger
AFTER INSERT OR DELETE OR UPDATE OF status ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();

-- Recalculate counts from approved memberships so existing communities are accurate.
UPDATE public.communities c
SET members_count = (
  SELECT COUNT(*)
  FROM public.community_members cm
  WHERE cm.community_id = c.id
    AND cm.status = 'approved'
);

-- Real community posts: normal posts remain allowed, but a post tied to a community
-- can only be created by an approved member/owner and private-community posts are
-- visible only to approved members/owner.
DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
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
        OR c.user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.community_members cm
          WHERE cm.community_id = c.id
            AND cm.user_id = auth.uid()
            AND cm.status = 'approved'
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
    OR EXISTS (
      SELECT 1
      FROM public.communities c
      WHERE c.id = posts.community_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.community_members cm
            WHERE cm.community_id = c.id
              AND cm.user_id = auth.uid()
              AND cm.status = 'approved'
          )
        )
    )
  )
);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (
  auth.uid() = user_id
  OR (
    community_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.communities c
      WHERE c.id = posts.community_id
        AND c.user_id = auth.uid()
    )
  )
  OR (
    community_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.community_members cm
      WHERE cm.community_id = posts.community_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('admin', 'moderator')
        AND cm.status = 'approved'
    )
  )
);

-- Protect likes/comments/shares/reposts belonging to private communities.
CREATE OR REPLACE FUNCTION public.can_view_post(
  p_post_id UUID,
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
    FROM public.posts p
    LEFT JOIN public.communities c ON c.id = p.community_id
    WHERE p.id = p_post_id
      AND (
        p.community_id IS NULL
        OR c.is_private = false
        OR c.user_id = p_user_id
        OR public.is_community_member(c.id, p_user_id)
      )
  );
$$;

DROP POLICY IF EXISTS "Users can view all likes" ON public.post_likes;
CREATE POLICY "Users can view likes on visible posts"
ON public.post_likes
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create likes" ON public.post_likes;
CREATE POLICY "Users can create likes on visible posts"
ON public.post_likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_view_post(post_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view all comments" ON public.post_comments;
CREATE POLICY "Users can view comments on visible posts"
ON public.post_comments
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
CREATE POLICY "Users can create comments on visible posts"
ON public.post_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_view_post(post_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view all shares" ON public.post_shares;
CREATE POLICY "Users can view shares on visible posts"
ON public.post_shares
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create shares" ON public.post_shares;
CREATE POLICY "Users can create shares on visible posts"
ON public.post_shares
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_view_post(post_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can view all reposts" ON public.post_reposts;
CREATE POLICY "Users can view reposts on visible posts"
ON public.post_reposts
FOR SELECT
USING (public.can_view_post(post_id, auth.uid()));

DROP POLICY IF EXISTS "Users can create their own reposts" ON public.post_reposts;
CREATE POLICY "Users can create reposts on visible posts"
ON public.post_reposts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.can_view_post(post_id, auth.uid())
);

-- Existing community-join notifications should fire only for actual approvals.
CREATE OR REPLACE FUNCTION public.handle_community_join_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  community_owner_id UUID;
  community_name TEXT;
  member_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    SELECT c.user_id, c.name
    INTO community_owner_id, community_name
    FROM public.communities c
    WHERE c.id = NEW.community_id;

    SELECT pr.full_name
    INTO member_name
    FROM public.profiles pr
    WHERE pr.id = NEW.user_id;

    IF community_owner_id IS NOT NULL
       AND community_owner_id <> NEW.user_id THEN
      PERFORM public.create_notification(
        community_owner_id,
        'community',
        COALESCE(member_name, 'Someone') || ' joined your community',
        COALESCE(member_name, 'Someone') || ' joined "' || COALESCE(community_name, 'your community') || '".',
        NULL,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_community_member_insert ON public.community_members;
DROP TRIGGER IF EXISTS trg_notify_community_join ON public.community_members;
CREATE TRIGGER on_community_member_insert
AFTER INSERT ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.handle_community_join_notification();

-- BizCoins: a private join request earns the community-join reward only after approval.
CREATE OR REPLACE FUNCTION public.handle_bizcoins_community_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 3);
  ELSIF TG_OP = 'UPDATE'
        AND OLD.status <> 'approved'
        AND NEW.status = 'approved' THEN
    PERFORM public.award_bizcoins(NEW.user_id, 3);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bizcoins_community_join ON public.community_members;
CREATE TRIGGER trg_bizcoins_community_join
AFTER INSERT OR UPDATE OF status ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.handle_bizcoins_community_join();

-- Notify a private-community owner only when a request is actually approved.
CREATE OR REPLACE FUNCTION public.handle_community_join_approval_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  community_owner_id UUID;
  community_name TEXT;
  member_name TEXT;
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.status <> 'approved'
     AND NEW.status = 'approved' THEN

    SELECT c.user_id, c.name
    INTO community_owner_id, community_name
    FROM public.communities c
    WHERE c.id = NEW.community_id;

    SELECT p.full_name
    INTO member_name
    FROM public.profiles p
    WHERE p.id = NEW.user_id;

    IF community_owner_id IS NOT NULL
       AND community_owner_id <> NEW.user_id THEN
      PERFORM public.create_notification(
        community_owner_id,
        'community',
        COALESCE(member_name, 'Someone') || ' joined your community',
        COALESCE(member_name, 'Someone') || ' was approved to join "' || COALESCE(community_name, 'your community') || '".',
        NULL,
        NEW.user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_community_member_approval ON public.community_members;
CREATE TRIGGER on_community_member_approval
AFTER UPDATE OF status ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.handle_community_join_approval_notification();
