-- Add repost columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS repost_of_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS repost_of_user_id uuid,
ADD COLUMN IF NOT EXISTS reposts_count integer DEFAULT 0;

-- Create index for faster repost queries
CREATE INDEX IF NOT EXISTS idx_posts_repost_of_post_id ON public.posts(repost_of_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_repost_of_user_id ON public.posts(repost_of_user_id);

-- Create reposts tracking table (to prevent duplicate reposts)
CREATE TABLE IF NOT EXISTS public.post_reposts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on reposts table
ALTER TABLE public.post_reposts ENABLE ROW LEVEL SECURITY;

-- RLS policies for reposts
CREATE POLICY "Users can view all reposts" 
ON public.post_reposts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reposts" 
ON public.post_reposts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reposts" 
ON public.post_reposts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update reposts count
CREATE OR REPLACE FUNCTION public.update_repost_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET reposts_count = reposts_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET reposts_count = GREATEST(0, reposts_count - 1) WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for repost count updates
DROP TRIGGER IF EXISTS update_reposts_count_trigger ON public.post_reposts;
CREATE TRIGGER update_reposts_count_trigger
AFTER INSERT OR DELETE ON public.post_reposts
FOR EACH ROW
EXECUTE FUNCTION public.update_repost_count();