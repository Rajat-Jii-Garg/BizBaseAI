
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Image, 
  Video, 
  FileText, 
  Mic, 
  Loader2, 
  Sparkles,
  Brain,
  Palette,
  Zap,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SmartPostComposerProps {
  onCreatePost: (content: string, mediaUrl?: string, mediaType?: string) => Promise<void>;
}

const SmartPostComposer: React.FC<SmartPostComposerProps> = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleAlbumSelect = () => {
    fileInputRef.current?.click();
  };

  const generateAISuggestions = async () => {
    const suggestions = [
      "💡 Share a professional insight about your recent project experience",
      "🚀 Discuss emerging trends in your industry",
      "🎯 Highlight a key achievement or milestone",
      "🤝 Share valuable advice for fellow professionals",
      "📈 Analyze market developments or opportunities"
    ];
    setAiSuggestions(suggestions);
  };

  const applySuggestion = (suggestion: string) => {
    setContent(suggestion.replace(/^[^\s]+\s/, ''));
  };

  const handleSubmit = async () => {
    if (!content.trim() && !mediaFile) return;

    setLoading(true);
    try {
      let mediaUrl = '';
      if (mediaFile) {
        // In a real app, you'd upload to storage here
        mediaUrl = mediaPreview || '';
      }
      
      await onCreatePost(content, mediaUrl, mediaFile?.type);
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setAiSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-blue-100">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">
                {user?.user_metadata?.full_name || 'Professional User'}
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Eye className="w-3 h-3 mr-1" />
                Public
              </Badge>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your professional insights..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px] text-base"
            />
          </div>
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="mb-4 relative">
            <div className="rounded-lg overflow-hidden border-2 border-gray-200">
              {mediaFile?.type.startsWith('image/') ? (
                <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full h-48" />
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 bg-white/90"
              onClick={() => {
                setMediaFile(null);
                setMediaPreview(null);
              }}
            >
              Remove
            </Button>
          </div>
        )}

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI Content Suggestions</span>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 bg-white rounded-md cursor-pointer hover:bg-purple-100 transition-colors"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:bg-blue-50 flex items-center gap-2"
              onClick={handleCameraCapture}
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Camera</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-600 hover:bg-green-50 flex items-center gap-2"
              onClick={handleAlbumSelect}
            >
              <Image className="w-5 h-5" />
              <span className="text-sm font-medium">Album</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-600 hover:bg-purple-50 flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              <span className="text-sm font-medium">Record</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-orange-600 hover:bg-orange-50 flex items-center gap-2"
              onClick={generateAISuggestions}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI Ideas</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Boost
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaFile) || loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default SmartPostComposer;
