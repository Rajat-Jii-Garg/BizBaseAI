import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePowerScore } from '@/hooks/usePowerScore';
import { Zap, User, FileText, Users, Heart, Coins } from 'lucide-react';

const PowerScoreCard = () => {
  const { score, breakdown } = usePowerScore();

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return 'Elite';
    if (s >= 60) return 'Strong';
    if (s >= 40) return 'Growing';
    return 'Starter';
  };

  const breakdownItems = [
    { label: 'Profile', value: breakdown.profile || 0, max: 20, icon: User, color: 'bg-blue-500' },
    { label: 'Posts', value: breakdown.posts || 0, max: 25, icon: FileText, color: 'bg-purple-500' },
    { label: 'Network', value: breakdown.connections || 0, max: 20, icon: Users, color: 'bg-green-500' },
    { label: 'Engagement', value: breakdown.engagement || 0, max: 20, icon: Heart, color: 'bg-pink-500' },
    { label: 'BizCoins', value: breakdown.coins || 0, max: 15, icon: Coins, color: 'bg-amber-500' },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-amber-500" />
          Power Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-black ${getScoreColor(score)}`}>{score}</div>
          <p className="text-xs text-muted-foreground">{getScoreLabel(score)} Profile</p>
          <Progress value={score} className="h-2 mt-2" />
        </div>
        <div className="space-y-2">
          {breakdownItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`p-1 rounded ${item.color}`}>
                <item.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
              <span className="text-xs font-bold text-foreground">{item.value}/{item.max}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerScoreCard;
