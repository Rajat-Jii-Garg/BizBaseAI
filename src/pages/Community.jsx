import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Globe, Lock, Users, MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Community = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [community, setCommunity] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCommunity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCommunity(data);

      if (user) {
        const { data: mem, error: memErr } = await supabase
          .from('community_members')
          .select('id')
          .eq('community_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        if (memErr) throw memErr;
        setJoined(!!mem);
      }
    } catch (err) {
      console.error('Error loading community:', err);
      toast({ title: 'Error', description: err?.message || 'Unable to load community', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleJoin = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('community_members').insert({ community_id: id, user_id: user.id, role: 'member' });
      if (error) throw error;
      setJoined(true);
      setCommunity((c) => (c ? { ...c, members_count: (c.members_count || 0) + 1 } : c));
      toast({ title: 'Joined community' });
    } catch (e) {
      toast({ title: 'Error', description: e?.message || 'Failed to join', variant: 'destructive' });
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setJoined(false);
      setCommunity((c) => (c ? { ...c, members_count: Math.max((c.members_count || 1) - 1, 0) } : c));
      toast({ title: 'Left community' });
    } catch (e) {
      toast({ title: 'Error', description: e?.message || 'Failed to leave', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto p-6">
          <Card className="animate-pulse">
            <div className="h-40 bg-gray-200" />
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto p-6">
          <Button variant="outline" onClick={() => navigate('/communities')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h1 className="text-2xl font-semibold">Community not available</h1>
              <p className="text-gray-600 mt-2">It may be private or does not exist.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="outline" onClick={() => navigate('/communities')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Communities
          </Button>
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600">
              {community.image_url && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundImage: `url(${community.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                {community.is_private ? (
                  <Badge className="bg-red-500 text-white"><Lock className="w-3 h-3 mr-1" />Private</Badge>
                ) : (
                  <Badge className="bg-green-500 text-white"><Globe className="w-3 h-3 mr-1" />Public</Badge>
                )}
              </div>
            </div>
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl font-bold">{community.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700">{community.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{community.category}</Badge>
                <Badge variant="secondary"><Users className="w-3 h-3 mr-1" />{community.members_count || 0} members</Badge>
              </div>
              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {community.tags.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs"><Hash className="w-3 h-3 mr-1" />{t}</Badge>
                  ))}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                {joined ? (
                  <>
                    <Button variant="outline" onClick={handleLeave}>Leave</Button>
                    <Button><MessageSquare className="w-4 h-4 mr-2" />Open Discussions</Button>
                  </>
                ) : (
                  <Button onClick={handleJoin} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Join Community</Button>
                )}
              </div>

              {community.rules && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Community Guidelines</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{community.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Community;
