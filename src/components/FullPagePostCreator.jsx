import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Image, 
  Video, 
  Hash, 
  AtSign, 
  Smile, 
  MapPin,
  Loader2,
  Globe,
  Sparkles,
  Send,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const FullPagePostCreator = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const maxCharacters = 3000;

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB' });
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const uploadMedia = async () => {
    if (!mediaFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucketName = 'avatars'; // reuse existing bucket

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`posts/${fileName}`, mediaFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(`posts/${fileName}`);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something to post');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (mediaFile) {
        mediaUrl = await uploadMedia();
      }

      await createPost(content, mediaUrl);
      toast.success('Post published successfully!', {
        description: 'Your post is now visible to your network'
      });
      setContent('');
      removeMedia();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const insertMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + '@' + content.substring(start);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const insertHashtag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + '#' + content.substring(start);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleMediaSelect(e, 'image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => handleMediaSelect(e, 'video')}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-gray-800">Create Post</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || loading || uploading}
          className={cn(
            "rounded-full px-5 font-semibold transition-all",
            content.trim() 
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg" 
              : "bg-gray-200 text-gray-400"
          )}
        >
          {loading || uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 mr-1" />
              Post
            </>
          )}
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 ring-2 ring-blue-200 shadow-md flex-shrink-0">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Input Area */}
          <div className="flex-1">
            <div className="mb-2">
              <p className="font-semibold text-gray-900">{profile?.full_name || 'You'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="w-3 h-3" />
                <span>Anyone can see this post</span>
              </div>
            </div>

            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your professional insights..."
              className="min-h-[200px] border-0 p-0 text-lg resize-none focus-visible:ring-0 placeholder:text-gray-400"
              maxLength={maxCharacters}
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
                {mediaType === 'image' ? (
                  <img 
                    src={mediaPreview} 
                    alt="Selected media" 
                    className="w-full max-h-[300px] object-cover"
                  />
                ) : (
                  <video 
                    src={mediaPreview} 
                    controls 
                    className="w-full max-h-[300px]"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Character Count */}
        <div className="flex justify-end mb-3">
          <span className={cn(
            "text-xs font-medium",
            content.length > maxCharacters * 0.9 ? "text-orange-500" : "text-gray-400"
          )}>
            {content.length} / {maxCharacters}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
            className="text-blue-600 hover:bg-blue-50 rounded-full gap-2 flex-shrink-0"
          >
            <Image className="w-5 h-5" />
            <span className="text-sm">Photo</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            className="text-green-600 hover:bg-green-50 rounded-full gap-2 flex-shrink-0"
          >
            <Video className="w-5 h-5" />
            <span className="text-sm">Video</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={insertHashtag}
            className="text-orange-600 hover:bg-orange-50 rounded-full gap-2 flex-shrink-0"
          >
            <Hash className="w-5 h-5" />
            <span className="text-sm">Hashtag</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={insertMention}
            className="text-purple-600 hover:bg-purple-50 rounded-full gap-2 flex-shrink-0"
          >
            <AtSign className="w-5 h-5" />
            <span className="text-sm">Mention</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-pink-600 hover:bg-pink-50 rounded-full gap-2 flex-shrink-0"
          >
            <Smile className="w-5 h-5" />
            <span className="text-sm">Emoji</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 rounded-full gap-2 flex-shrink-0"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm">Location</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullPagePostCreator;
