
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Image, Video, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PostCreatorProps {
  onCreatePost: (content: string, imageUrl?: string) => Promise<void>;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      await onCreatePost(content);
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your professional thoughts..."
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px] text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-2">
              <Image className="w-4 h-4 mr-1" />
              <span className="text-xs">Photo</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 h-8 px-2">
              <Video className="w-4 h-4 mr-1" />
              <span className="text-xs">Video</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 h-8 px-2">
              <FileText className="w-4 h-4 mr-1" />
              <span className="text-xs">Article</span>
            </Button>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 h-8 px-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : null}
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
