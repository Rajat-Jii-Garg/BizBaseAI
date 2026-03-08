import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePolls = () => {
  const { user } = useAuth();

  const createPoll = useCallback(async (postId, question, options) => {
    if (!user || !postId) return null;
    const { data, error } = await supabase
      .from('post_polls')
      .insert({ post_id: postId, question, options: options.map(o => ({ text: o, votes: 0 })) })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [user]);

  const getPoll = useCallback(async (postId) => {
    const { data: poll } = await supabase
      .from('post_polls')
      .select('*')
      .eq('post_id', postId)
      .maybeSingle();
    
    if (!poll) return null;

    // Get vote counts
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', poll.id);

    // Get user's vote
    let userVote = null;
    if (user) {
      const { data: myVote } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();
      userVote = myVote?.option_index ?? null;
    }

    // Count votes per option
    const voteCounts = {};
    votes?.forEach(v => {
      voteCounts[v.option_index] = (voteCounts[v.option_index] || 0) + 1;
    });

    const totalVotes = votes?.length || 0;
    const options = poll.options.map((opt, i) => ({
      ...opt,
      votes: voteCounts[i] || 0,
      percentage: totalVotes > 0 ? Math.round(((voteCounts[i] || 0) / totalVotes) * 100) : 0
    }));

    return { ...poll, options, totalVotes, userVote };
  }, [user]);

  const vote = useCallback(async (pollId, optionIndex) => {
    if (!user) return false;
    const { error } = await supabase
      .from('poll_votes')
      .upsert({ poll_id: pollId, user_id: user.id, option_index: optionIndex }, { onConflict: 'poll_id,user_id' });
    return !error;
  }, [user]);

  return { createPoll, getPoll, vote };
};
