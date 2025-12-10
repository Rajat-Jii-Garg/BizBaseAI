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

export default function PublicProfileView({ profile }) {
  if (!profile) return <p>No profile found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
      <p className="text-muted-foreground mt-2">{profile.profession}</p>

      <img
        src={profile.avatar_url}
        alt="avatar"
        className="w-28 h-28 rounded-full mt-4"
      />

      <p className="mt-4">{profile.bio}</p>
    </div>
  );
}