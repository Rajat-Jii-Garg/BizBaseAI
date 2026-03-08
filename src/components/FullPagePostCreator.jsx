import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Image, 
  Video, 
  Hash, 
  AtSign, 
  Loader2,
  Globe,
  Sparkles,
  Send,
  XCircle,
  Camera
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
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);

  // AI states
  const [aiTone, setAiTone] = useState('professional');
  const [aiLoading, setAiLoading] = useState(false);

  // Mention/Hashtag autocomplete
  const [showMentions, setShowMentions] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);
  const [mentionUsers, setMentionUsers] = useState([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  const textareaRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const maxCharacters = 3000;

  const tones = [
    { value: 'professional', label: '💼 Professional' },
    { value: 'warm', label: '🤝 Warm' },
    { value: 'calm', label: '🧘 Calm' },
    { value: 'bold', label: '🔥 Bold' },
    { value: 'casual', label: '😎 Casual' },
  ];

  // Search users for mentions
  const searchUsers = async (query) => {
    if (!query) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);
      setMentionUsers(data || []);
    } catch (e) {
      console.error('Error searching users:', e);
    }
  };

  // Search hashtags
  const searchHashtags = async (query) => {
    if (!query) return;
    try {
      const { data } = await supabase
        .from('hashtags')
        .select('name')
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(5);
      setHashtagSuggestions(data?.map(h => h.name) || []);
    } catch (e) {
      console.error('Error searching hashtags:', e);
    }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    setContent(text);
    setCursorPosition(position);

    const beforeCursor = text.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    const hashtagMatch = beforeCursor.match(/#(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setShowHashtags(false);
      searchUsers(mentionMatch[1]);
    } else if (hashtagMatch) {
      setShowHashtags(true);
      setShowMentions(false);
      searchHashtags(hashtagMatch[1]);
    } else {
      setShowMentions(false);
      setShowHashtags(false);
    }
  };

  const insertMentionUser = (selectedUser) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const beforeMention = beforeCursor.replace(/@\w*$/, '');
    setContent(`${beforeMention}@${selectedUser.full_name} ${afterCursor}`);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const insertHashtagSuggestion = (tag) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const beforeHash = beforeCursor.replace(/#\w*$/, '');
    setContent(`${beforeHash}#${tag} ${afterCursor}`);
    setShowHashtags(false);
    textareaRef.current?.focus();
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 10MB' });
      return;
    }
    setMediaFile(file);
    setMediaType(type);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
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
      const { error } = await supabase.storage
        .from('posts')
        .upload(`posts/${fileName}`, mediaFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(`posts/${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const rewriteWithAI = async () => {
    if (!content.trim()) {
      toast.error('Write something first to rewrite with AI');
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-post', {
        body: { content, tone: aiTone }
      });
      if (error) throw error;
      if (data?.rewritten) {
        setContent(data.rewritten);
        toast.success('Post rewritten with AI!');
      }
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast.error('Failed to rewrite with AI');
    } finally {
      setAiLoading(false);
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
      if (mediaFile) mediaUrl = await uploadMedia();
      await createPost(content, mediaUrl);
      toast.success('Post published successfully!');
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

  const addAtCursor = (char) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + char + content.substring(start);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleMediaSelect(e, 'image')} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleMediaSelect(e, 'video')} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-purple-50 to-blue-50">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9">
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-foreground">Create Post</span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || loading || uploading}
          className={cn(
            "rounded-full px-5 font-semibold",
            content.trim()
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              : "bg-muted text-muted-foreground"
          )}
        >
          {loading || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Post</>}
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* User Info */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <Avatar className="h-11 w-11 ring-2 ring-blue-200 shadow-md">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-sm">{profile?.full_name || 'You'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span>Anyone can see this post</span>
            </div>
          </div>
        </div>

        {/* Textarea with autocomplete */}
        <div className="px-4 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="What's on your mind? Share your professional insights..."
            className="min-h-[150px] border-0 p-0 text-base resize-none focus-visible:ring-0 placeholder:text-muted-foreground/60 bg-transparent"
            maxLength={maxCharacters}
          />

          {/* Mentions Dropdown */}
          {showMentions && mentionUsers.length > 0 && (
            <div className="absolute left-0 right-0 bg-card rounded-lg shadow-lg border border-border mt-1 z-10 max-h-48 overflow-y-auto">
              {mentionUsers.map((u) => (
                <button key={u.id} onClick={() => insertMentionUser(u)} className="flex items-center gap-3 w-full p-3 hover:bg-muted transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback className="text-xs">{u.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium text-foreground text-sm">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Hashtags Dropdown */}
          {showHashtags && hashtagSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 bg-card rounded-lg shadow-lg border border-border mt-1 z-10 max-h-48 overflow-y-auto">
              {hashtagSuggestions.map((tag) => (
                <button key={tag} onClick={() => insertHashtagSuggestion(tag)} className="flex items-center gap-3 w-full p-3 hover:bg-muted transition-colors">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-foreground text-sm">#{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative mx-4 mt-3 rounded-xl overflow-hidden border border-border/50">
            <Button variant="ghost" size="icon" onClick={removeMedia} className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8">
              <XCircle className="w-5 h-5" />
            </Button>
            {mediaType === 'image' ? (
              <img src={mediaPreview} alt="Selected media" className="w-full max-h-[250px] object-cover" />
            ) : (
              <video src={mediaPreview} controls className="w-full max-h-[250px]" />
            )}
          </div>
        )}

        {/* AI Rewrite Section */}
        <div className="mx-4 mt-4 p-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50/80 to-blue-50/80">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-foreground">Rewrite with AI</h3>
          </div>

          {/* Tone Selector */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select Tone</p>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setAiTone(t.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    aiTone === t.value
                      ? "bg-purple-600 text-white border-purple-600 shadow-md"
                      : "bg-card text-foreground border-border hover:border-purple-300 hover:bg-purple-50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rewrite Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={rewriteWithAI}
            disabled={aiLoading || !content.trim()}
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-100 font-semibold"
          >
            {aiLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rewriting...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Rewrite with AI</>
            )}
          </Button>
        </div>

        {/* Spacer for bottom bar */}
        <div className="h-24" />
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-border p-3 bg-card">
        {/* Character Count */}
        <div className="flex justify-end mb-2">
          <span className={cn(
            "text-xs font-medium",
            content.length > maxCharacters * 0.9 ? "text-orange-500" : "text-muted-foreground"
          )}>
            {content.length} / {maxCharacters}
          </span>
        </div>

        {/* Media & Tool Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()} className="text-blue-600 hover:bg-blue-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
            <Camera className="w-4 h-4" />
            <span className="text-xs">Photo</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => videoInputRef.current?.click()} className="text-green-600 hover:bg-green-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
            <Video className="w-4 h-4" />
            <span className="text-xs">Video</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addAtCursor('#')} className="text-orange-600 hover:bg-orange-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
            <Hash className="w-4 h-4" />
            <span className="text-xs">Hashtag</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addAtCursor('@')} className="text-purple-600 hover:bg-purple-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
            <AtSign className="w-4 h-4" />
            <span className="text-xs">Mention</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullPagePostCreator;
