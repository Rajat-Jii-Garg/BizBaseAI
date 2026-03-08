import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BizCoinsCard = () => {
  const { user } = useAuth();
  const [bizcoins, setBizcoins] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchCoins = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('bizcoins')
        .eq('id', user.id)
        .single();
      setBizcoins(data?.bizcoins || 0);
    };

    fetchCoins();

    const channel = supabase
      .channel(`bizcoins_${user.id}_${Date.now()}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        if (payload.new?.bizcoins !== undefined) {
          setBizcoins(payload.new.bizcoins || 0);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const getLabel = (coins) => {
    if (coins >= 1000) return '👑 Elite';
    if (coins >= 500) return '⚡ Power User';
    if (coins >= 100) return '🌟 Rising Star';
    return '🚀 Getting Started';
  };

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 via-card to-orange-500/5 border-border overflow-hidden">
      <CardContent className="p-6 text-center relative">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-1">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <div className="text-center">
                <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {bizcoins}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
            <BadgeCheck className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-sm font-semibold text-amber-600 mt-3">BizCoins</p>
        <p className="text-xs text-muted-foreground mt-1">{getLabel(bizcoins)}</p>
      </CardContent>
    </Card>
  );
};

export default BizCoinsCard;
