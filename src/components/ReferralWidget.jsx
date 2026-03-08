import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReferrals } from '@/hooks/useReferrals';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ReferralWidget = () => {
  const { stats, createReferralLink } = useReferrals();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    const link = await createReferralLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-sm text-foreground">Invite & Earn</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Earn 10 BizCoins for each friend who joins!
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-center flex-1 bg-white/80 rounded-lg p-2">
            <div className="text-lg font-black text-amber-600">{stats.completed}</div>
            <div className="text-[10px] text-muted-foreground">Joined</div>
          </div>
          <div className="text-center flex-1 bg-white/80 rounded-lg p-2">
            <div className="text-lg font-black text-amber-600">{stats.coinsEarned}</div>
            <div className="text-[10px] text-muted-foreground">Coins</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/referrals')}>
            <Users className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralWidget;
