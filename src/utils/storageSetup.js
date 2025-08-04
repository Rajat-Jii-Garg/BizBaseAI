
import { supabase } from '@/integrations/supabase/client';

export const ensureAvatarsBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating avatars bucket:', createError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    return false;
  }
};
