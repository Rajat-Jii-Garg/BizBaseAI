
-- Create hashtags table
CREATE TABLE public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  usage_count INTEGER NOT NULL DEFAULT 0
);

-- Create post_hashtags junction table
CREATE TABLE public.post_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

-- Create post_mentions table for user tagging
CREATE TABLE public.post_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, mentioned_user_id)
);

-- Add RLS policies for hashtags
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hashtags" 
  ON public.hashtags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create hashtags" 
  ON public.hashtags 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add RLS policies for post_hashtags
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post hashtags" 
  ON public.post_hashtags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create post hashtags for their posts" 
  ON public.post_hashtags 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete post hashtags for their posts" 
  ON public.post_hashtags 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Add RLS policies for post_mentions
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post mentions" 
  ON public.post_mentions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create mentions for their posts" 
  ON public.post_mentions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete mentions for their posts" 
  ON public.post_mentions 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Function to extract and process hashtags from post content
CREATE OR REPLACE FUNCTION public.process_post_hashtags(post_id UUID, content TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hashtag_text TEXT;
  hashtag_record RECORD;
BEGIN
  -- Delete existing hashtags for this post
  DELETE FROM public.post_hashtags WHERE post_id = post_id;
  
  -- Extract hashtags using regex
  FOR hashtag_text IN 
    SELECT DISTINCT LOWER(trim(regexp_replace(match[1], '[^a-zA-Z0-9_]', '', 'g')))
    FROM regexp_split_to_table(content, '\s+') AS t(word),
         regexp_matches(word, '#([a-zA-Z0-9_]+)', 'g') AS match
    WHERE length(trim(regexp_replace(match[1], '[^a-zA-Z0-9_]', '', 'g'))) > 0
  LOOP
    -- Insert or get existing hashtag
    INSERT INTO public.hashtags (name, usage_count)
    VALUES (hashtag_text, 1)
    ON CONFLICT (name) 
    DO UPDATE SET usage_count = hashtags.usage_count + 1;
    
    -- Get hashtag ID
    SELECT id INTO hashtag_record FROM public.hashtags WHERE name = hashtag_text;
    
    -- Link hashtag to post
    INSERT INTO public.post_hashtags (post_id, hashtag_id)
    VALUES (post_id, hashtag_record.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Function to extract and process user mentions from post content
CREATE OR REPLACE FUNCTION public.process_post_mentions(post_id UUID, content TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_text TEXT;
  user_record RECORD;
BEGIN
  -- Delete existing mentions for this post
  DELETE FROM public.post_mentions WHERE post_id = post_id;
  
  -- Extract mentions using regex
  FOR username_text IN 
    SELECT DISTINCT LOWER(trim(regexp_replace(match[1], '[^a-zA-Z0-9_.]', '', 'g')))
    FROM regexp_split_to_table(content, '\s+') AS t(word),
         regexp_matches(word, '@([a-zA-Z0-9_.]+)', 'g') AS match
    WHERE length(trim(regexp_replace(match[1], '[^a-zA-Z0-9_.]', '', 'g'))) > 0
  LOOP
    -- Find user by email or full_name (case insensitive)
    SELECT id INTO user_record 
    FROM public.profiles 
    WHERE LOWER(email) = username_text 
       OR LOWER(full_name) = username_text
    LIMIT 1;
    
    -- If user found, create mention
    IF user_record.id IS NOT NULL THEN
      INSERT INTO public.post_mentions (post_id, mentioned_user_id)
      VALUES (post_id, user_record.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_hashtags_name ON public.hashtags(name);
CREATE INDEX idx_hashtags_usage_count ON public.hashtags(usage_count DESC);
CREATE INDEX idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON public.post_hashtags(hashtag_id);
CREATE INDEX idx_post_mentions_post_id ON public.post_mentions(post_id);
CREATE INDEX idx_post_mentions_user_id ON public.post_mentions(mentioned_user_id);
