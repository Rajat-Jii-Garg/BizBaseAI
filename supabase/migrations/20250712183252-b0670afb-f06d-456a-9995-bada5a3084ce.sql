
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('avatars', 'avatars', true, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 5242880)
ON CONFLICT (id) DO NOTHING;

-- Create posts bucket if it doesn't exist  
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('posts', 'posts', true, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'], 10485760)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for posts bucket
CREATE POLICY "Authenticated users can upload to posts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view posts images" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can update their own post images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts' AND auth.uid() IS NOT NULL
);
