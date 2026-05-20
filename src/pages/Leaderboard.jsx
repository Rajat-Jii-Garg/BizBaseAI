import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Coins, TrendingUp, Loader2, Flame, Star, Award, Zap } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useBizCoins } from '@/hooks/useBizCoins';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const Leaderboard = () => {
  const { getLeaderboard } = useBizCoins();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('all');

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
    if (index === 0) return <Crown className="w-7 h-7 text-yellow-500 drop-shadow-lg" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-7 h-7 flex items-center justify-center text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const myRank = leaders.findIndex(l => l.id === profile?.id) + 1;
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <DashboardLayout>
      <SEOHead title="Leaderboard - Top Contributors" description="See the top contributors on BizBase AI. Compete, earn BizCoins, and climb the leaderboard." path="/leaderboard" />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 opacity-10">
            <Trophy className="w-48 h-48 -mt-8 -mr-8" />
          </div>
          <div className="relative z-10 text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Top Contributors</h1>
            </div>
            <p className="text-white/80 text-lg">Compete, earn BizCoins & become the top contributor!</p>
            
            {/* Time frame filters */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {['all', 'monthly', 'weekly'].map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeFrame === tf ? 'secondary' : 'ghost'}
                  className={timeFrame === tf ? 'bg-white/20 text-white border-white/30' : 'text-white/70 hover:text-white hover:bg-white/10'}
                  onClick={() => setTimeFrame(tf)}
                >
                  {tf === 'all' ? 'All Time' : tf === 'monthly' ? 'This Month' : 'This Week'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* My Rank Card */}
        {profile && (
          <Card className="border-2 border-primary/30 bg-primary/5 shadow-lg">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/30">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  {myRank > 0 && myRank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{profile.full_name || 'You'}</p>
                  <p className="text-sm text-muted-foreground">{profile.current_position || 'BizBase Member'}</p>
                  {myRank > 0 && (
                    <Badge variant="outline" className="mt-1 text-primary border-primary/30">
                      <Zap className="w-3 h-3 mr-1" /> Rank #{myRank}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-yellow-500" />
                  <span className="text-3xl font-extrabold text-foreground">{profile.bizcoins || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">BizCoins earned</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How to earn */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> How to earn BizCoins
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { action: 'Create Post', coins: '+10', icon: '📝' },
                { action: 'Get a Like', coins: '+2', icon: '❤️' },
                { action: 'Comment', coins: '+5', icon: '💬' },
                { action: 'Share Post', coins: '+15', icon: '🔄' },
              ].map((item) => (
                <div key={item.action} className="flex items-center gap-2 bg-background rounded-lg p-3 border border-border">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.action}</p>
                    <p className="text-xs font-bold text-primary">{item.coins}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Podium */}
        {!loading && top3.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 items-end">
            {/* 2nd place */}
            <div className="text-center">
              <div className="bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 pt-6 border border-border cursor-pointer hover:shadow-lg transition-all"
                onClick={() => top3[1].username && navigate(`/${top3[1].username}`)}>
                <Avatar className="h-16 w-16 mx-auto ring-4 ring-slate-300 dark:ring-slate-600">
                  <AvatarImage src={top3[1].avatar_url} />
                  <AvatarFallback className="bg-slate-500 text-white font-bold text-lg">{top3[1].full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <Medal className="w-6 h-6 text-slate-400 mx-auto mt-2" />
                <p className="font-semibold text-sm text-foreground mt-1 truncate">{top3[1].full_name || 'Anonymous'}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-bold text-sm text-foreground">{top3[1].bizcoins}</span>
                </div>
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center -mt-4">
              <div className="bg-gradient-to-b from-yellow-50 to-amber-100 dark:from-yellow-950/40 dark:to-amber-950/40 rounded-xl p-4 pt-6 border-2 border-yellow-300 dark:border-yellow-700 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => top3[0].username && navigate(`/${top3[0].username}`)}>
                <div className="relative">
                  <Avatar className="h-20 w-20 mx-auto ring-4 ring-yellow-400">
                    <AvatarImage src={top3[0].avatar_url} />
                    <AvatarFallback className="bg-yellow-500 text-white font-bold text-xl">{top3[0].full_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
                  </div>
                </div>
                <p className="font-bold text-foreground mt-3 truncate">{top3[0].full_name || 'Anonymous'}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-extrabold text-lg text-foreground">{top3[0].bizcoins}</span>
                </div>
                <Badge className="mt-2 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Champion
                </Badge>
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 pt-6 border border-border cursor-pointer hover:shadow-lg transition-all"
                onClick={() => top3[2].username && navigate(`/${top3[2].username}`)}>
                <Avatar className="h-16 w-16 mx-auto ring-4 ring-amber-400 dark:ring-amber-600">
                  <AvatarImage src={top3[2].avatar_url} />
                  <AvatarFallback className="bg-amber-600 text-white font-bold text-lg">{top3[2].full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <Medal className="w-6 h-6 text-amber-600 mx-auto mt-2" />
                <p className="font-semibold text-sm text-foreground mt-1 truncate">{top3[2].full_name || 'Anonymous'}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-bold text-sm text-foreground">{top3[2].bizcoins}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of leaderboard */}
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
            {rest.map((leader, idx) => {
              const index = idx + 3;
              const isMe = leader.id === profile?.id;
              return (
                <Card 
                  key={leader.id} 
                  className={`cursor-pointer hover:shadow-md transition-all ${isMe ? 'border-primary/40 bg-primary/5' : 'bg-card border-border'}`}
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
                        <p className="font-semibold text-foreground">
                          {leader.full_name || 'Anonymous'}
                          {isMe && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                        </p>
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
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
