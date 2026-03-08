import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Loader2 } from 'lucide-react';
import { useProfileViews } from '@/hooks/useProfileViews';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const WhoViewedProfile = () => {
  const { viewers, viewCount, loading } = useProfileViews();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Eye className="w-4 h-4 text-primary" />
          Who Viewed Your Profile
          {viewCount > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{viewCount} this week</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : viewers.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No profile views this week. Share your profile to get noticed!</p>
        ) : (
          viewers.slice(0, 5).map((view) => (
            <div 
              key={view.id} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => view.profile?.username && navigate(`/${view.profile.username}`)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={view.profile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {view.profile?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{view.profile?.full_name || 'Anonymous'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{view.profile?.current_position || 'BizBase User'}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default WhoViewedProfile;
