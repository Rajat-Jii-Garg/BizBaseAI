
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Video, Loader2, Hash, AtSign, X, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EnhancedPostComposer = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Search users for mentions
  const searchUsers = async (query) => {
    if (!query) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Search hashtags
  const searchHashtags = async (query) => {
    if (!query) return;
    
    try {
      const { data, error } = await supabase
        .from('hashtags')
        .select('name')
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setHashtags(data?.map(h => h.name) || []);
    } catch (error) {
      console.error('Error searching hashtags:', error);
    }
  };

  // Handle text change and detect mentions/hashtags
  const handleTextChange = (e) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    setContent(text);
    setCursorPosition(position);

    // Check for mentions (@)
    const beforeCursor = text.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
      setShowHashtags(false);
      searchUsers(mentionMatch[1]);
    } else {
      setShowMentions(false);
    }

    // Check for hashtags (#)
    const hashtagMatch = beforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      setHashtagQuery(hashtagMatch[1]);
      setShowHashtags(true);
      setShowMentions(false);
      searchHashtags(hashtagMatch[1]);
    } else {
      setShowHashtags(false);
    }

    if (!mentionMatch && !hashtagMatch) {
      setShowMentions(false);
      setShowHashtags(false);
    }
  };

  // Insert mention
  const insertMention = (selectedUser) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const beforeMention = beforeCursor.replace(/@\w*$/, '');
    const newContent = `${beforeMention}@${selectedUser.full_name} ${afterCursor}`;
    
    setContent(newContent);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  // Insert hashtag
  const insertHashtag = (selectedHashtag) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const beforeHashtag = beforeCursor.replace(/#\w*$/, '');
    const newContent = `${beforeHashtag}#${selectedHashtag} ${afterCursor}`;
    
    setContent(newContent);
    setShowHashtags(false);
    textareaRef.current?.focus();
  };

  // Handle media upload
  const handleMediaUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaType(type);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove media
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Upload media to Supabase Storage
  const uploadMedia = async (file, type) => {
    if (!user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      console.log('Uploading media to:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('Media uploaded successfully, public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Upload Error",
        description: `Failed to upload ${type}. Please try again.`,
        variant: "destructive"
      });
      return null;
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) {
      toast({
        title: "Error",
        description: "Please add some content or media to your post.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (mediaFile && mediaType) {
        console.log('Uploading media...');
        mediaUrl = await uploadMedia(mediaFile, mediaType);
        if (!mediaUrl) {
          setLoading(false);
          return;
        }
      }

      console.log('Creating post with content:', content, 'mediaUrl:', mediaUrl, 'mediaType:', mediaType);
      
      // Call parent callback to create post
      await onCreatePost(content.trim(), mediaUrl || undefined, mediaType || undefined);
      
      // Reset form
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      
      toast({
        title: "Success",
        description: "Post created successfully!"
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract hashtags and mentions for preview
  const extractHashtags = (text) => {
    const matches = text.match(/#[\w]+/g);
    return matches || [];
  };

  const extractMentions = (text) => {
    const matches = text.match(/@[\w\s]+/g);
    return matches || [];
  };

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-blue-100">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              placeholder="What's on your mind? Use @ to mention users and # for hashtags..."
              className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[120px] text-base leading-relaxed"
            />
            
            {/* Mentions Dropdown */}
            {showMentions && users.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 z-10 max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hashtags Dropdown */}
            {showHashtags && hashtags.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 mt-1 z-10 max-h-48 overflow-y-auto">
                {hashtags.map((hashtag) => (
                  <button
                    key={hashtag}
                    onClick={() => insertHashtag(hashtag)}
                    className="flex items-center space-x-3 w-full p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Hash className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900">#{hashtag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-4 relative">
            {mediaType === 'image' && (
              <img 
                src={mediaPreview} 
                alt="Preview" 
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            )}
            {mediaType === 'video' && (
              <video 
                src={mediaPreview} 
                controls
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
            )}
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={removeMedia}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Content Preview */}
        {/* {content && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Preview:</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {extractHashtags(content).map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {hashtag}
                </Badge>
              ))}
              {extractMentions(content).map((mention, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {mention}
                </Badge>
              ))}
            </div>
          </div>
        )} */}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleMediaUpload(e, 'image')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleMediaUpload(e, 'video')}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:bg-blue-50 h-10 px-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline text-sm font-medium">Photo</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:bg-green-50 h-10 px-4"
              onClick={() => videoInputRef.current?.click()}
            >
              <Video className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline text-sm font-medium">Video</span>
            </Button>
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={(!content.trim() && !mediaFile) || loading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 h-10 px-6 font-medium w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostComposer;
