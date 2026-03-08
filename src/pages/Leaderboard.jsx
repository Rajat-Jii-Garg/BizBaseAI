import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Coins, TrendingUp, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBizCoins } from '@/hooks/useBizCoins';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const { getLeaderboard } = useBizCoins();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaders(data);
      setLoading(false);
    };
    load();
  }, [getLeaderboard]);

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const getRankBg = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800';
    if (index === 1) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-700';
    if (index === 2) return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800';
    return 'bg-card border-border';
  };

  const myRank = leaders.findIndex(l => l.id === profile?.id) + 1;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-foreground">Top Contributors</h1>
          </div>
          <p className="text-muted-foreground">Most active members on BizBase</p>
          {myRank > 0 && (
            <Badge variant="secondary" className="text-sm">
              Your Rank: #{myRank} • {profile?.bizcoins || 0} BizCoins
            </Badge>
          )}
        </div>

        {/* My Stats */}
        {profile && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{profile.full_name || 'You'}</p>
                  <p className="text-xs text-muted-foreground">{profile.current_position || 'BizBase Member'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-bold text-foreground">{profile.bizcoins || 0}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">No contributors yet</h3>
              <p className="text-muted-foreground">Start posting and engaging to earn BizCoins!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, index) => (
              <Card 
                key={leader.id} 
                className={`cursor-pointer hover:shadow-md transition-all ${getRankBg(index)}`}
                onClick={() => leader.username && navigate(`/${leader.username}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRankIcon(index)}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={leader.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {leader.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{leader.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {leader.current_position ? `${leader.current_position}${leader.company_name ? ` at ${leader.company_name}` : ''}` : '@' + (leader.username || 'user')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-foreground">{leader.bizcoins}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
