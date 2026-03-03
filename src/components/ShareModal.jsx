import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link, MessageSquare, Send, Mail, Instagram, Linkedin, Facebook, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ShareModal = ({ postShareUrl, onClose }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [messageUsers, setMessageUsers] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('connections')
        .select('addressee_id, profiles:addressee_id(id, full_name, avatar_url)')
        .eq('requester_id', user.id)
        .eq('status', 'accepted')
        .limit(12);
      if (data) setMessageUsers(data.map(item => item.profiles));
    };
    fetchConnections();
  }, [user]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    const url = postShareUrl || window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(postShareUrl || window.location.href);

  const platforms = [
    {
      name: 'WhatsApp',
      icon: <MessageSquare size={20} />,
      bg: 'bg-green-500',
      onClick: () => window.open(`https://wa.me/?text=${shareUrl}`, '_blank'),
    },
    {
      name: 'Twitter',
      icon: <Send size={20} />,
      bg: 'bg-sky-500',
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}`, '_blank'),
    },
    {
      name: 'Gmail',
      icon: <Mail size={20} />,
      bg: 'bg-red-500',
      onClick: () => window.open(`mailto:?subject=Check this out&body=${shareUrl}`),
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      bg: 'bg-blue-700',
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      bg: 'bg-blue-600',
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank'),
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 pb-8 sm:p-6 space-y-6 shadow-2xl animate-slide-up border-t sm:border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Share Post</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy Link Bar */}
        <div
          className="flex items-center gap-3 bg-muted/50 rounded-xl p-3 cursor-pointer hover:bg-muted/70 transition-colors border border-border/50"
          onClick={handleCopy}
        >
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            {copied ? (
              <Check size={18} className="text-green-600" />
            ) : (
              <Link size={18} className="text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{copied ? 'Link Copied!' : 'Copy Link'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{postShareUrl || window.location.href}</p>
          </div>
        </div>

        {/* Send to connections */}
        {messageUsers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Send to</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {messageUsers.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col items-center min-w-[64px] cursor-pointer group"
                  onClick={() => {
                    navigator.clipboard.writeText(postShareUrl || window.location.href);
                    onClose();
                  }}
                >
                  <Avatar className="h-12 w-12 ring-2 ring-background shadow-md group-hover:ring-primary/30 transition-all">
                    <AvatarImage src={person.avatar_url} />
                    <AvatarFallback className="text-xs">{person.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] mt-1.5 truncate w-14 text-center text-muted-foreground">
                    {person.full_name?.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share to platforms */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3">Share to</p>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center min-w-[64px] cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  platform.onClick();
                  onClose();
                }}
              >
                <div className={`h-12 w-12 ${platform.bg} text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                  {platform.icon}
                </div>
                <p className="text-[10px] mt-1.5 text-muted-foreground">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
