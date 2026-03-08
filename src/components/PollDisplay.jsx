import React, { useState, useEffect } from 'react';
import { usePolls } from '@/hooks/usePolls';
import { BarChart3, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PollDisplay = ({ postId }) => {
  const { getPoll, vote } = usePolls();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getPoll(postId);
      setPoll(data);
    };
    load();
  }, [postId]);

  if (!poll) return null;

  const handleVote = async (index) => {
    if (!user || voting) return;
    setVoting(true);
    await vote(poll.id, index);
    const updated = await getPoll(postId);
    setPoll(updated);
    setVoting(false);
  };

  const hasVoted = poll.userVote !== null;

  return (
    <div className="mt-3 p-4 bg-muted/30 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">{poll.question}</span>
      </div>
      <div className="space-y-2">
        {poll.options.map((option, i) => (
          <button
            key={i}
            onClick={() => !hasVoted && handleVote(i)}
            disabled={hasVoted || voting}
            className={`w-full relative overflow-hidden rounded-lg border transition-all text-left ${
              hasVoted
                ? poll.userVote === i
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
                : 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
            }`}
          >
            {hasVoted && (
              <div
                className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500"
                style={{ width: `${option.percentage}%` }}
              />
            )}
            <div className="relative flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                {hasVoted && poll.userVote === i && (
                  <Check className="w-4 h-4 text-primary" />
                )}
                <span className="text-sm font-medium text-foreground">{option.text}</span>
              </div>
              {hasVoted && (
                <span className="text-xs font-bold text-muted-foreground">{option.percentage}%</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}</p>
    </div>
  );
};

export default PollDisplay;
