import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Send, MoreVertical, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CommentsSection = ({ postId, commentsCount, onCommentUpdate }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(data?.map(comment => comment.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Combine comments with profiles
      const commentsWithProfiles = data?.map(comment => ({
        ...comment,
        profiles: profiles?.find(profile => profile.id === comment.user_id)
      })) || [];

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      onCommentUpdate();
      toast({ title: "Feedback added successfully!" });
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({ title: "Failed to add feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  return (
    // <div className="space-y-4">
    //   <Button
    //     variant="ghost"
    //     onClick={() => setShowComments(!showComments)}
    //     className="text-sm text-muted-foreground p-0 h-auto flex items-center gap-1"
    //   >
    //     <MessageSquare className="w-4 h-4" />
    //     {commentsCount} feedback
    //   </Button>

    //   {showComments && (
    //     <div className="space-y-4">
    //       {/* Add Feedback */}
    //       <div className="flex gap-3">
    //         <Avatar className="h-8 w-8">
    //           <AvatarImage src={profile?.avatar_url} />
    //           <AvatarFallback className="text-xs">
    //             {profile?.full_name?.charAt(0) || 'U'}
    //           </AvatarFallback>
    //         </Avatar>
    //         <div className="flex-1 space-y-2">
    //           <Textarea
    //             placeholder="Write your feedback..."
    //             value={newComment}
    //             onChange={(e) => setNewComment(e.target.value)}
    //             className="min-h-[80px] resize-none"
    //           />
    //           <Button
    //             onClick={handleSubmitComment}
    //             disabled={loading || !newComment.trim()}
    //             size="sm"
    //             className="ml-auto flex items-center gap-2"
    //           >
    //             <Send className="h-4 w-4" />
    //             Send Feedback
    //           </Button>
    //         </div>
    //       </div>

    //       {/* Feedback List */}
    //       <div className="space-y-3">
    //         {comments.map((comment) => (
    //           <Card key={comment.id} className="p-3">
    //             <div className="flex items-start gap-3">
    //               <Avatar 
    //                 className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
    //                 onClick={() => navigate(`/profile/${comment.user_id}`)}
    //               >
    //                 <AvatarImage src={comment.profiles?.avatar_url} />
    //                 <AvatarFallback className="text-xs">
    //                   {comment.profiles?.full_name?.charAt(0) || 'U'}
    //                 </AvatarFallback>
    //               </Avatar>
    //               <div className="flex-1">
    //                 <div className="flex items-center justify-between">
    //                   <p 
    //                     className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
    //                     onClick={() => navigate(`/profile/${comment.user_id}`)}
    //                   >
    //                     {comment.profiles?.full_name || 'User'}
    //                   </p>
    //                   <div className="flex items-center gap-2">
    //                     <span className="text-xs text-muted-foreground">
    //                       {new Date(comment.created_at).toLocaleDateString()}
    //                     </span>
    //                     <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
    //                       <MoreVertical className="h-3 w-3" />
    //                     </Button>
    //                   </div>
    //                 </div>
    //                 <p className="text-sm mt-1">{comment.content}</p>
    //               </div>
    //             </div>
    //           </Card>
    //         ))}
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
};

export default CommentsSection;
