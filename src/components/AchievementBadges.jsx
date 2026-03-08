import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Loader2, Lock } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const AchievementBadges = ({ compact = false }) => {
  const { earnedBadges, allBadges, loading } = useAchievements();

  if (loading) {
    return compact ? null : (
      <Card>
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const earnedIds = new Set(earnedBadges.map(b => b.id));

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {earnedBadges.slice(0, 6).map(badge => (
          <Tooltip key={badge.id}>
            <TooltipTrigger>
              <span className="text-lg cursor-default">{badge.icon}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {earnedBadges.length > 6 && (
          <Badge variant="secondary" className="text-xs">+{earnedBadges.length - 6}</Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Award className="w-4 h-4 text-primary" />
          Achievements
          <Badge variant="secondary" className="ml-auto text-xs">{earnedBadges.length}/{allBadges.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {allBadges.map(badge => {
            const earned = earnedIds.has(badge.id);
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger>
                  <div className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    earned ? 'bg-primary/5 hover:bg-primary/10' : 'bg-muted/30 opacity-40'
                  }`}>
                    <span className="text-2xl mb-1">{earned ? badge.icon : '🔒'}</span>
                    <p className="text-[10px] text-center font-medium text-foreground leading-tight">{badge.title}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {!earned && <p className="text-xs text-yellow-600 mt-1">🔒 Not unlocked yet</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;
