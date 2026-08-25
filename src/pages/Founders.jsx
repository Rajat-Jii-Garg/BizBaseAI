import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import SEOHead from '@/components/SEOHead';
import LoginModal from '@/components/LoginModal';
import FounderProfileModal from '@/components/FounderProfileModal';
import CreateFounderAskModal from '@/components/CreateFounderAskModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatTimeAgo } from '@/lib/timeAgo';
import { buildShareUrl } from '@/lib/siteUrl';
import {
  ASK_KINDS,
  FOUNDER_STAGES,
  useFounderAsks,
  useFounderDirectory,
  useMyFounderProfile,
} from '@/hooks/useFounders';
import {
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  MessageSquare,
  Pencil,
  Rocket,
  Search,
  Share2,
  Users,
  X,
} from 'lucide-react';

const stageLabel = (value) => FOUNDER_STAGES.find((s) => s.value === value)?.label || value;
const kindLabel = (value) => ASK_KINDS.find((k) => k.value === value)?.label || value;

const Founders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('board');
  const [kindFilter, setKindFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const { founders, loading: loadingFounders } = useFounderDirectory();
  const { founderProfile, saveProfile } = useMyFounderProfile();
  const { asks, loading: loadingAsks, createAsk, closeAsk, respondToAsk } = useFounderAsks(kindFilter);

  const requireAuth = () => {
    if (!user) {
      setShowLogin(true);
      return false;
    }
    return true;
  };

  const filteredAsks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return asks;
    return asks.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.includes(q))
    );
  }, [asks, search]);

  const filteredFounders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return founders;
    return founders.filter(
      (f) =>
        f.startup_name?.toLowerCase().includes(q) ||
        f.tagline?.toLowerCase().includes(q) ||
        f.industry?.toLowerCase().includes(q) ||
        f.city?.toLowerCase().includes(q) ||
        f.author?.full_name?.toLowerCase().includes(q)
    );
  }, [founders, search]);

  const handleShare = async () => {
    const url = buildShareUrl('/founders');
    const shareData = {
      title: 'Founders on BizBase',
      text: 'Indian founders sharing what they are building and what they need. Join in:',
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch (_) {
      /* user cancelled */
    }
  };

  const handleSendReply = async (askId) => {
    if (!requireAuth()) return;
    if (!replyText.trim()) return;
    setSendingReply(true);
    const { error } = await respondToAsk(askId, replyText.trim());
    setSendingReply(false);
    if (error) {
      toast.error(error.message || 'Could not send your reply');
      return;
    }
    setReplyText('');
    setReplyTo(null);
    toast.success('Reply sent — the founder has been notified');
  };

  return (
    <DashboardLayout>
      <SEOHead
        title="Founders Hub — Indian Startup Founders, Co-founders & Asks"
        description="Discover Indian startup founders on BizBase. See what they are building, post what you need — co-founder, hiring, intros, first customers or feedback — and get real help from other founders."
        path="/founders"
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border border-border p-5 sm:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">Founders Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Build in public. Ask for exactly what you need.
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
                A working space for Indian founders — post your ask, get co-founders, first customers,
                warm intros, hiring help and honest product feedback from other founders.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => (requireAuth() ? setShowAskModal(true) : null)}
                className="whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Post an ask
              </Button>
              <Button
                variant="outline"
                onClick={() => (requireAuth() ? setShowProfileModal(true) : null)}
              >
                {founderProfile ? <Pencil className="w-4 h-4 mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
                {founderProfile ? 'Edit startup' : 'Add your startup'}
              </Button>
              <Button variant="ghost" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {founderProfile && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              You are listed as founder of <span className="font-semibold text-foreground">{founderProfile.startup_name}</span>
            </div>
          )}
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="inline-flex rounded-xl bg-muted p-1">
            {[
              { id: 'board', label: 'Founder Board' },
              { id: 'directory', label: 'Founders' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'board' ? 'Search asks, tags, city...' : 'Search startups, industry, city...'}
              className="pl-9"
            />
          </div>
        </div>

        {tab === 'board' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
              <button onClick={() => setKindFilter('all')} className="focus:outline-none">
                <Badge variant={kindFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer whitespace-nowrap">
                  All
                </Badge>
              </button>
              {ASK_KINDS.map((k) => (
                <button key={k.value} onClick={() => setKindFilter(k.value)} className="focus:outline-none">
                  <Badge
                    variant={kindFilter === k.value ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                  >
                    {k.label}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="space-y-3 mt-2">
              {loadingAsks && <p className="text-sm text-muted-foreground py-8 text-center">Loading asks...</p>}

              {!loadingAsks && filteredAsks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Rocket className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground">No asks here yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first founder to post what you need — you will get replies from the community.
                    </p>
                    <Button className="mt-4" onClick={() => (requireAuth() ? setShowAskModal(true) : null)}>
                      Post the first ask
                    </Button>
                  </CardContent>
                </Card>
              )}

              {filteredAsks.map((ask) => (
                <Card key={ask.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={ask.author?.avatar_url} />
                        <AvatarFallback>{ask.author?.full_name?.charAt(0) || 'F'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {ask.author?.username ? (
                            <Link
                              to={`/@${ask.author.username}`}
                              className="font-semibold text-foreground hover:underline text-sm"
                            >
                              {ask.author?.full_name || 'Founder'}
                            </Link>
                          ) : (
                            <span className="font-semibold text-foreground text-sm">
                              {ask.author?.full_name || 'Founder'}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(ask.created_at)}</span>
                          <Badge variant="secondary" className="text-[11px]">{kindLabel(ask.kind)}</Badge>
                          {ask.status === 'closed' && (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">Closed</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-foreground leading-snug">{ask.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{ask.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {ask.city && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {ask.city}
                            </span>
                          )}
                          {(ask.tags || []).map((t) => (
                            <Badge key={t} variant="outline" className="text-[11px]">#{t}</Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          {ask.status === 'open' && ask.user_id !== user?.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (!requireAuth()) return;
                                setReplyTo(replyTo === ask.id ? null : ask.id);
                                setReplyText('');
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              I can help
                            </Button>
                          )}
                          {ask.user_id === user?.id && ask.status === 'open' && (
                            <Button size="sm" variant="ghost" onClick={() => closeAsk(ask.id)}>
                              <X className="w-4 h-4 mr-2" />
                              Mark as resolved
                            </Button>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {ask.responses_count || 0} {ask.responses_count === 1 ? 'reply' : 'replies'}
                          </span>
                        </div>

                        {replyTo === ask.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tell them how exactly you can help..."
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSendReply(ask.id)} disabled={sendingReply}>
                                {sendingReply ? 'Sending...' : 'Send reply'}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {tab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingFounders && <p className="text-sm text-muted-foreground py-8">Loading founders...</p>}

            {!loadingFounders && filteredFounders.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="p-8 text-center">
                  <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">No founders listed yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your startup and be the first one here.</p>
                  <Button className="mt-4" onClick={() => (requireAuth() ? setShowProfileModal(true) : null)}>
                    Add your startup
                  </Button>
                </CardContent>
              </Card>
            )}

            {filteredFounders.map((f) => (
              <Card key={f.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={f.author?.avatar_url} />
                      <AvatarFallback>{f.startup_name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{f.startup_name}</h3>
                        <Badge variant="secondary" className="text-[11px]">{stageLabel(f.stage)}</Badge>
                        {f.is_hiring && <Badge className="text-[11px]">Hiring</Badge>}
                      </div>
                      {f.tagline && <p className="text-sm text-muted-foreground mt-1">{f.tagline}</p>}

                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                        {f.industry && <span>{f.industry}</span>}
                        {f.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {f.city}
                          </span>
                        )}
                        {f.team_size && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" /> {f.team_size}
                          </span>
                        )}
                        {f.funding_stage && <span>{f.funding_stage}</span>}
                      </div>

                      {(f.looking_for || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {f.looking_for.map((l) => (
                            <Badge key={l} variant="outline" className="text-[11px]">{l}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        {f.author?.username && (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/@${f.author.username}`)}>
                            View profile
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => (requireAuth() ? navigate(`/messages?to=${f.user_id}`) : null)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        {f.website && (
                          <a
                            href={f.website.startsWith('http') ? f.website : `https://${f.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Globe className="w-3 h-3" /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <FounderProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        founderProfile={founderProfile}
        onSave={saveProfile}
      />
      <CreateFounderAskModal open={showAskModal} onOpenChange={setShowAskModal} onCreate={createAsk} />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </DashboardLayout>
  );
};

export default Founders;
