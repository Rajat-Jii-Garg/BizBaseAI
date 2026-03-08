import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
  X, Video, Hash, AtSign, Loader2, Sparkles, Send, XCircle, Camera, Users, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const FullPageCommunityPostCreator = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const [aiTone, setAiTone] = useState('professional');
  const [aiLoading, setAiLoading] = useState(false);

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

  // Fetch user's communities (joined + created)
  useEffect(() => {
    if (!isOpen || !user) return;
    const fetchCommunities = async () => {
      setLoadingCommunities(true);
      try {
        // Get communities user created
        const { data: created } = await supabase
          .from('communities')
          .select('id, name, image_url')
          .eq('user_id', user.id);

        // Get communities user joined
        const { data: memberOf } = await supabase
          .from('community_members')
          .select('community_id, communities(id, name, image_url)')
          .eq('user_id', user.id);

        const joinedCommunities = memberOf?.map(m => m.communities).filter(Boolean) || [];
        const allMap = new Map();
        (created || []).forEach(c => allMap.set(c.id, c));
        joinedCommunities.forEach(c => allMap.set(c.id, c));
        setCommunities(Array.from(allMap.values()));
      } catch (e) {
        console.error('Error fetching communities:', e);
      } finally {
        setLoadingCommunities(false);
      }
    };
    fetchCommunities();
  }, [isOpen, user]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setSelectedCommunity('');
      setMediaFile(null);
      setMediaPreview(null);
      setMediaType(null);
    }
  }, [isOpen]);

  const searchUsers = async (query) => {
    if (!query) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);
      setMentionUsers(data || []);
    } catch (e) { console.error(e); }
  };

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
    } catch (e) { console.error(e); }
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    const position = e.target.selectionStart;
    setContent(text);
    setCursorPosition(position);
    const beforeCursor = text.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    const hashtagMatch = beforeCursor.match(/#(\w*)$/);
    if (mentionMatch) { setShowMentions(true); setShowHashtags(false); searchUsers(mentionMatch[1]); }
    else if (hashtagMatch) { setShowHashtags(true); setShowMentions(false); searchHashtags(hashtagMatch[1]); }
    else { setShowMentions(false); setShowHashtags(false); }
  };

  const insertMentionUser = (u) => {
    const before = content.substring(0, cursorPosition).replace(/@\w*$/, '');
    setContent(`${before}@${u.full_name} ${content.substring(cursorPosition)}`);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const insertHashtagSuggestion = (tag) => {
    const before = content.substring(0, cursorPosition).replace(/#\w*$/, '');
    setContent(`${before}#${tag} ${content.substring(cursorPosition)}`);
    setShowHashtags(false);
    textareaRef.current?.focus();
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large', { description: 'Maximum file size is 10MB' }); return; }
    setMediaFile(file); setMediaType(type);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const uploadMedia = async () => {
    if (!mediaFile || !user) return null;
    setUploading(true);
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('posts').upload(`posts/${fileName}`, mediaFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('posts').getPublicUrl(`posts/${fileName}`);
      return urlData.publicUrl;
    } catch (error) { toast.error('Failed to upload media'); return null; }
    finally { setUploading(false); }
  };

  const rewriteWithAI = async () => {
    if (!content.trim()) { toast.error('Write something first to rewrite with AI'); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-post', { body: { content, tone: aiTone } });
      if (error) throw error;
      if (data?.rewritten) { setContent(data.rewritten); toast.success('Post rewritten with AI!'); }
    } catch (error) { toast.error('Failed to rewrite with AI'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async () => {
    if (!selectedCommunity) { toast.error('Please select a community'); return; }
    if (!content.trim()) { toast.error('Please write something to post'); return; }
    setLoading(true);
    try {
      let mediaUrl = null;
      if (mediaFile) mediaUrl = await uploadMedia();
      const communityName = communities.find(c => c.id === selectedCommunity)?.name || '';
      // Post with community tag in content
      await createPost(`[Community: ${communityName}]\n\n${content}`, mediaUrl);
      toast.success(`Post published in ${communityName}!`);
      setContent(''); setSelectedCommunity(''); removeMedia();
      onClose();
    } catch (error) { toast.error('Failed to create post'); }
    finally { setLoading(false); }
  };

  const addAtCursor = (char) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    setContent(content.substring(0, start) + char + content.substring(start));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + 1, start + 1); }, 0);
  };

  if (!isOpen) return null;

  const hasCommunities = communities.length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleMediaSelect(e, 'image')} />
      <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleMediaSelect(e, 'video')} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-green-50 to-emerald-50">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-9 w-9">
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-green-600" />
          <span className="font-bold text-foreground">Post in Community</span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || !selectedCommunity || loading || uploading}
          className={cn(
            "rounded-full px-5 font-semibold",
            content.trim() && selectedCommunity
              ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
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
          <Avatar className="h-11 w-11 ring-2 ring-green-200 shadow-md">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground text-sm">{profile?.full_name || 'You'}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Posting in a community</span>
            </div>
          </div>
        </div>

        {/* Community Selector */}
        <div className="px-4 py-3">
          {loadingCommunities ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading communities...
            </div>
          ) : hasCommunities ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Select Community</p>
              <div className="space-y-2">
                {communities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCommunity(c.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      selectedCommunity === c.id
                        ? "border-green-500 bg-green-50 ring-2 ring-green-200 shadow-sm"
                        : "border-border bg-card hover:border-green-300 hover:bg-green-50/50"
                    )}
                  >
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="font-medium text-sm text-foreground truncate">{c.name}</span>
                    {selectedCommunity === c.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-green-300 bg-green-50/50 p-5 text-center">
              <Users className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No Communities Yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Join Communities to grow and start building your personal brand on BizBase!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-100 font-semibold"
                onClick={() => { onClose(); navigate('/communities'); }}
              >
                Explore Communities <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Textarea with autocomplete - only show if user has communities */}
        {hasCommunities && (
          <>
            <div className="px-4 relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextChange}
                placeholder="Share something with the community..."
                className="min-h-[150px] border-0 p-0 text-base resize-none focus-visible:ring-0 placeholder:text-muted-foreground/60 bg-transparent"
                maxLength={maxCharacters}
              />

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
              <Button
                variant="outline" size="sm" onClick={rewriteWithAI}
                disabled={aiLoading || !content.trim()}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-100 font-semibold"
              >
                {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rewriting...</> : <><Sparkles className="w-4 h-4 mr-2" /> Rewrite with AI</>}
              </Button>
            </div>

            <div className="h-24" />
          </>
        )}
      </div>

      {/* Bottom Action Bar - only if has communities */}
      {hasCommunities && (
        <div className="border-t border-border p-3 bg-card">
          <div className="flex justify-end mb-2">
            <span className={cn("text-xs font-medium", content.length > maxCharacters * 0.9 ? "text-orange-500" : "text-muted-foreground")}>
              {content.length} / {maxCharacters}
            </span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()} className="text-blue-600 hover:bg-blue-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
              <Camera className="w-4 h-4" /><span className="text-xs">Photo</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => videoInputRef.current?.click()} className="text-green-600 hover:bg-green-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
              <Video className="w-4 h-4" /><span className="text-xs">Video</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addAtCursor('#')} className="text-orange-600 hover:bg-orange-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
              <Hash className="w-4 h-4" /><span className="text-xs">Hashtag</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addAtCursor('@')} className="text-purple-600 hover:bg-purple-50 rounded-full gap-1.5 flex-shrink-0 h-9 px-3">
              <AtSign className="w-4 h-4" /><span className="text-xs">Mention</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPageCommunityPostCreator;
