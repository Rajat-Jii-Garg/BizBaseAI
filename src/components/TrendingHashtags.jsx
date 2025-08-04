
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Hash, TrendingUp, Loader2 } from 'lucide-react';
import { useHashtags } from '@/hooks/useHashtags';

const TrendingHashtags: React.FC = () => {
  const { hashtags, loading } = useHashtags();

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hashtags.length === 0 ? (
          <div className="text-center py-8">
            <Hash className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No trending hashtags yet</p>
            <p className="text-sm text-gray-500">Start using hashtags in your posts!</p>
          </div>
        ) : (
          hashtags.map((hashtag, index) => (
            <div key={hashtag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">#{hashtag.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">{hashtag.usage_count} posts</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Trending
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingHashtags;
