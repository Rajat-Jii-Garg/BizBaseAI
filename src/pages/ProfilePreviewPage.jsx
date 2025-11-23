// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import DashboardLayout from '@/components/DashboardLayout';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client';
// import PublicProfileView from '@/components/PublicProfileView';

// export default function ProfilePreviewPage() {
//   const { userId } = useParams();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadProfile();
//   }, [userId]);

//   async function loadProfile() {
//     setLoading(true);

//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single();

//     if (!error) setProfile(data);

//     setLoading(false);
//   }

//   if (loading) return <p>Loading preview...</p>;

//   return <PublicProfileView profile={profile} />;
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import DashboardLayout from "@/components/DashboardLayout";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Briefcase,
  Calendar,
} from "lucide-react";

export default function ProfilePreviewPage() {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchPosts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setPosts(data || []);
    } catch (err) {
      console.error("Posts fetch error:", err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-medium">Loading profile preview...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6">

        {/* ======= PROFILE HEADER ======= */}
        <Card className="overflow-hidden shadow-lg border-border bg-card">

          {/* Banner */}
          <div className="relative h-32 md:h-48">
            <img
              src={
                profile?.banner_url ||
                "https://images.unsplash.com/photo-1557683316-973673baf926"
              }
              className="w-full h-full object-cover"
              alt="banner"
            />
          </div>

          <div className="px-4 md:px-6 pb-4 md:pb-6 relative">
            <div className="flex flex-col md:flex-row md:justify-between -mt-12 md:-mt-16">

              {/* Avatar */}
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* PREVIEW MODE = NO BUTTONS */}
            </div>

            {/* NAME + INFO */}
            <div className="mt-4">
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                {profile?.full_name}
                {profile?.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </h1>

              <p className="text-base md:text-lg text-muted-foreground">
                {profile?.profession || profile?.current_position}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}

                {profile?.company_name && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.company_name}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* CONTACT INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg mt-4">
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={profile.website}
                    target="_blank"
                    className="text-primary underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              {profile?.linkedin_url && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    className="text-primary underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ======= POSTS SECTION ======= */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Posts</CardTitle>
          </CardHeader>

          <CardContent>
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No posts available
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <p className="text-sm">{post.content}</p>

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        className="rounded-lg w-full max-h-80 object-cover"
                        alt="post"
                      />
                    )}

                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}