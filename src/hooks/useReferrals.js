import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBizCoins } from '@/hooks/useBizCoins';

export const useReferrals = () => {
  const { user, profile } = useAuth();
  const { awardCoins } = useBizCoins();
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, coinsEarned: 0 });

  const generateCode = useCallback(async () => {
    if (!user) return '';
    // Check if user already has a referral code
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
      return profile.referral_code;
    }
    // Generate unique code
    const code = `BIZ${user.id.substring(0, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);
    setReferralCode(code);
    return code;
  }, [user, profile]);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      setReferrals(data || []);
      const completed = data?.filter(r => r.status === 'completed').length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      setStats({
        total: data?.length || 0,
        completed,
        pending,
        coinsEarned: completed * 100 // 100 coins per successful referral
      });
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createReferralLink = useCallback(async () => {
    if (!user) return '';
    let code = referralCode;
    if (!code) code = await generateCode();
    return `${window.location.origin}/signup?ref=${code}`;
  }, [user, referralCode, generateCode]);

  const trackReferral = useCallback(async (code, newUserId) => {
    try {
      // Find referrer by code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();

      if (!referrer) return;

      // Create referral record
      await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referred_user_id: newUserId,
        referral_code: code,
        status: 'completed',
        coins_awarded: true,
        completed_at: new Date().toISOString()
      });

      // Award coins to referrer
      const { data: profile } = await supabase
        .from('profiles')
        .select('bizcoins')
        .eq('id', referrer.id)
        .single();
      
      await supabase
        .from('profiles')
        .update({ bizcoins: (profile?.bizcoins || 0) + 100 })
        .eq('id', referrer.id);

      // Update referred user
      await supabase
        .from('profiles')
        .update({ referred_by: referrer.id })
        .eq('id', newUserId);

    } catch (err) {
      console.error('Referral tracking error:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      generateCode();
      fetchReferrals();
    }
  }, [user, generateCode, fetchReferrals]);

  return { referrals, referralCode, stats, loading, createReferralLink, trackReferral, fetchReferrals };
};
