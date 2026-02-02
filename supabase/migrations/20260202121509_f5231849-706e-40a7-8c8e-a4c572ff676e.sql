-- =====================================================
-- USER BEHAVIOR TRACKING FOR PERSONALIZED FEED
-- =====================================================

-- Table to track content views and engagement time
CREATE TABLE public.user_content_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share', 'repost', 'save', 'click')),
  view_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Table to store inferred user interests based on behavior
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('hashtag', 'topic', 'content_type', 'industry', 'creator')),
  interest_value TEXT NOT NULL,
  score DECIMAL(5,2) DEFAULT 1.0,
  interaction_count INTEGER DEFAULT 1,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest_type, interest_value)
);

-- Table to track creator affinity (how much user engages with specific creators)
CREATE TABLE public.user_creator_affinity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affinity_score DECIMAL(5,2) DEFAULT 1.0,
  total_interactions INTEGER DEFAULT 1,
  last_interaction_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, creator_id)
);

-- Table to store user feed preferences
CREATE TABLE public.user_feed_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_content_types JSONB DEFAULT '["text", "image", "video"]'::jsonb,
  preferred_post_length TEXT DEFAULT 'any' CHECK (preferred_post_length IN ('short', 'medium', 'long', 'any')),
  discovery_ratio DECIMAL(3,2) DEFAULT 0.3,
  last_feed_refresh_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_creator_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_content_interactions
CREATE POLICY "Users can view own interactions" ON public.user_content_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.user_content_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON public.user_content_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_interests
CREATE POLICY "Users can view own interests" ON public.user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interests" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_creator_affinity
CREATE POLICY "Users can view own affinity" ON public.user_creator_affinity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own affinity" ON public.user_creator_affinity
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_feed_preferences
CREATE POLICY "Users can view own preferences" ON public.user_feed_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_feed_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_content_interactions_user ON public.user_content_interactions(user_id);
CREATE INDEX idx_content_interactions_post ON public.user_content_interactions(post_id);
CREATE INDEX idx_content_interactions_type ON public.user_content_interactions(interaction_type);
CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);
CREATE INDEX idx_user_interests_type_value ON public.user_interests(interest_type, interest_value);
CREATE INDEX idx_creator_affinity_user ON public.user_creator_affinity(user_id);
CREATE INDEX idx_creator_affinity_score ON public.user_creator_affinity(affinity_score DESC);
CREATE INDEX idx_feed_preferences_user ON public.user_feed_preferences(user_id);

-- Function to update user interests when they interact with content
CREATE OR REPLACE FUNCTION public.update_user_interests()
RETURNS TRIGGER AS $$
DECLARE
  post_content TEXT;
  hashtags TEXT[];
  hashtag TEXT;
  post_creator_id UUID;
BEGIN
  -- Get post content and creator
  SELECT content, user_id INTO post_content, post_creator_id
  FROM public.posts WHERE id = NEW.post_id;
  
  -- Extract hashtags
  SELECT ARRAY(SELECT DISTINCT (regexp_matches(post_content, '#(\w+)', 'g'))[1])
  INTO hashtags;
  
  -- Update hashtag interests
  FOREACH hashtag IN ARRAY hashtags LOOP
    INSERT INTO public.user_interests (user_id, interest_type, interest_value, score, interaction_count)
    VALUES (NEW.user_id, 'hashtag', LOWER(hashtag), 1.0, 1)
    ON CONFLICT (user_id, interest_type, interest_value)
    DO UPDATE SET 
      score = LEAST(user_interests.score + 0.5, 10.0),
      interaction_count = user_interests.interaction_count + 1,
      last_updated_at = now();
  END LOOP;
  
  -- Update creator affinity
  IF post_creator_id IS NOT NULL AND post_creator_id != NEW.user_id THEN
    INSERT INTO public.user_creator_affinity (user_id, creator_id, affinity_score, total_interactions)
    VALUES (NEW.user_id, post_creator_id, 1.0, 1)
    ON CONFLICT (user_id, creator_id)
    DO UPDATE SET 
      affinity_score = LEAST(user_creator_affinity.affinity_score + 0.5, 10.0),
      total_interactions = user_creator_affinity.total_interactions + 1,
      last_interaction_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update interests on interaction
CREATE TRIGGER update_interests_on_interaction
  AFTER INSERT ON public.user_content_interactions
  FOR EACH ROW
  WHEN (NEW.interaction_type IN ('like', 'comment', 'share', 'repost', 'save'))
  EXECUTE FUNCTION public.update_user_interests();

-- Function to decay old interests (run periodically)
CREATE OR REPLACE FUNCTION public.decay_user_interests()
RETURNS void AS $$
BEGIN
  -- Decay interests that haven't been updated in 7 days
  UPDATE public.user_interests
  SET score = GREATEST(score * 0.9, 0.1)
  WHERE last_updated_at < now() - interval '7 days';
  
  -- Decay creator affinity
  UPDATE public.user_creator_affinity
  SET affinity_score = GREATEST(affinity_score * 0.95, 0.1)
  WHERE last_interaction_at < now() - interval '7 days';
  
  -- Delete very low score interests
  DELETE FROM public.user_interests WHERE score < 0.2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;