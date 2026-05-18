import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Copy, Check, MessageSquare, Linkedin, Send, Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * ProfileShareCard
 * Premium shareable profile card with:
 *  - PNG download (html-to-image)
 *  - Public profile link copy
 *  - Native + social share (WhatsApp, LinkedIn, Twitter, Email)
 *  - QR code linking to /@username
 */
const ProfileShareCard = ({ open, onClose, profile }) => {
  const { toast } = useToast();
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const username = profile.username || '';
  const profileUrl = `https://bizbase-ai.lovable.app/@${username}`;
  const shareText = `Check out ${profile.full_name || 'my profile'} on BizBase — the AI-powered professional network 🚀`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0a0a1a',
      });
      const link = document.createElement('a');
      link.download = `${username || 'bizbase'}-card.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: 'Card downloaded!', description: 'Share it on WhatsApp, Insta story ya kahin bhi 🎉' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Download failed', description: 'Try again', variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: 'Link copied!', description: profileUrl });
  };

  const encodedUrl = encodeURIComponent(profileUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareTargets = [
    { name: 'WhatsApp', icon: MessageSquare, bg: 'bg-green-500', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'LinkedIn', icon: Linkedin, bg: 'bg-blue-700', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Twitter', icon: Send, bg: 'bg-sky-500', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'Email', icon: Mail, bg: 'bg-red-500', href: `mailto:?subject=${encodeURIComponent('Check my BizBase profile')}&body=${encodedText}%20${encodedUrl}` },
  ];

  const initials = (profile.full_name || 'U').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            Share your BizBase card
          </DialogTitle>
        </DialogHeader>

        {/* The card that gets exported to PNG */}
        <div className="px-5 pb-4">
          <div
            ref={cardRef}
            className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden text-white"
            style={{
              background:
                'radial-gradient(120% 80% at 0% 0%, #4f46e5 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, #ec4899 0%, transparent 55%), linear-gradient(135deg, #0a0a1a 0%, #141432 100%)',
            }}
          >
            {/* Subtle grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Top brand bar */}
            <div className="relative flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center font-black text-sm">
                  B
                </div>
                <span className="font-semibold tracking-tight text-sm">BizBase</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                Professional Card
              </span>
            </div>

            {/* Body */}
            <div className="relative px-5 pt-6 flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white/20 shadow-2xl">
                  <AvatarImage src={profile.avatar_url} crossOrigin="anonymous" />
                  <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 ring-2 ring-[#0a0a1a]">
                  <CheckCircle2 className="w-4 h-4 text-white" fill="currentColor" />
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold leading-tight">
                {profile.full_name || 'Professional User'}
              </h2>
              {username && (
                <p className="text-xs text-white/70 mt-0.5">@{username}</p>
              )}

              <p className="mt-2 text-[13px] text-white/85 font-medium max-w-[260px]">
                {profile.profession || profile.current_position || 'Building on BizBase'}
                {profile.company_name ? ` · ${profile.company_name}` : ''}
              </p>

              {profile.bio && (
                <p className="mt-2 text-[11px] text-white/60 line-clamp-2 max-w-[260px]">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Bottom: QR + CTA */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <div className="flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15">
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Connect with me</p>
                  <p className="text-xs font-semibold mt-0.5">bizbase-ai.lovable.app</p>
                  <p className="text-[10px] text-white/70">/@{username || 'username'}</p>
                </div>
                <div className="bg-white p-1.5 rounded-md shadow-md">
                  <QRCodeSVG value={profileUrl} size={56} level="M" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleDownload} disabled={downloading} className="w-full">
              <Download className="w-4 h-4 mr-1.5" />
              {downloading ? 'Saving...' : 'Download PNG'}
            </Button>
            <Button variant="outline" onClick={handleCopy} className="w-full">
              {copied ? <Check className="w-4 h-4 mr-1.5 text-green-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>

          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-2">Share to</p>
            <div className="flex gap-3">
              {shareTargets.map((t) => (
                <a
                  key={t.name}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className={`h-11 w-11 ${t.bg} text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] mt-1 text-muted-foreground">{t.name}</span>
                </a>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground pt-1 border-t border-border/40">
            Powered by <span className="font-semibold text-primary">BizBase</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileShareCard;
