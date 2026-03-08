import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferrals } from '@/hooks/useReferrals';
import { toast } from 'sonner';
import { 
  Gift, Copy, Users, Trophy, Coins, Share2, Check, 
  Sparkles, ArrowRight, Crown, Star, Zap
} from 'lucide-react';

const Referrals = () => {
  const { referrals, referralCode, stats, loading, createReferralLink } = useReferrals();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = await createReferralLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = async () => {
    const link = await createReferralLink();
    window.open(`https://wa.me/?text=Join BizBase - the next-gen professional networking platform! Sign up with my link and we both earn BizCoins! 🚀 ${link}`, '_blank');
  };

  const rewards = [
    { coins: 100, label: 'Per successful referral', icon: Gift },
    { coins: 500, label: 'Refer 5 users bonus', icon: Star },
    { coins: 1000, label: 'Refer 10 users - Premium Free', icon: Crown },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Hero */}
        <Card className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                  <Gift className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black">Invite & Earn</h1>
                  <p className="text-white/80">Earn 10 BizCoins for every friend who joins!</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  onClick={handleCopyLink}
                  className="bg-white text-orange-600 hover:bg-white/90 font-bold"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Referral Link'}
                </Button>
                <Button onClick={handleShareWhatsApp} variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
              {referralCode && (
                <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-3 inline-flex items-center gap-3">
                  <span className="text-sm text-white/70">Your Code:</span>
                  <span className="font-mono font-bold text-lg">{referralCode}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invites', value: stats.total, icon: Users, color: 'text-blue-600' },
            { label: 'Completed', value: stats.completed, icon: Check, color: 'text-green-600' },
            { label: 'Pending', value: stats.pending, icon: Zap, color: 'text-amber-600' },
            { label: 'Coins Earned', value: stats.coinsEarned, icon: Coins, color: 'text-purple-600' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rewards */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rewards.map((reward, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <reward.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="font-medium text-foreground">{reward.label}</span>
                </div>
                <Badge className="bg-amber-100 text-amber-700 font-bold">
                  <Coins className="w-3 h-3 mr-1" />
                  {reward.coins}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No referrals yet. Share your link to start earning!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {ref.referred_email || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ref.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={ref.status === 'completed' ? 'default' : 'secondary'}>
                      {ref.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
