import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Camera,
  CheckCircle,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Share2,
  Eye,
  Users,
  Bookmark,
  FileText,
  MessageSquare,
  Repeat2,
  Settings,
  User,
  Briefcase,
  Calendar
} from 'lucide-react';
import PublicProfileView from '@/components/PublicProfileView';

export default function ProfilePreviewPage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error) setProfile(data);

    setLoading(false);
  }

  if (loading) return <p>Loading preview...</p>;

  return <PublicProfileView profile={profile} />;
}
