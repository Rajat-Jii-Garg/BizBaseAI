import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useReferrals = () => {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, coinsEarned: 0 });

  // Generate a stable referral code once, then reuse it forever
  const generateCode = useCallback(async () => {
    if (!user) return '';
    
    // If profile already has a referral_code, use it
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code);
      return profile.referral_code;
    }
    
    // Generate a stable code from user ID (deterministic, never changes)
    const code = `BIZ${user.id.substring(0, 8).toUpperCase()}`;
    
    // Save to profile
    await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);
    setReferralCode(code);
    return code;
  }, [user, profile?.referral_code]);

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
        coinsEarned: completed * 10 // 10 BizCoins per successful referral
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

  // Called during signup to track a referral
  const trackReferral = useCallback(async (code, newUserId) => {
    try {
      // Find referrer by code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, bizcoins')
        .eq('referral_code', code)
        .single();

      if (!referrer || referrer.id === newUserId) return;

      // Create referral record
      await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referred_user_id: newUserId,
        referral_code: code,
        status: 'completed',
        coins_awarded: true,
        completed_at: new Date().toISOString()
      });

      // Award 10 BizCoins to referrer
      await supabase
        .from('profiles')
        .update({ bizcoins: (referrer.bizcoins || 0) + 10 })
        .eq('id', referrer.id);

      // Mark referred user
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
