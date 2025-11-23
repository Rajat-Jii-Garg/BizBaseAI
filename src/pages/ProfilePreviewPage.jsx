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
import { useParams, useNavigate } from "react-router-dom";
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

const ProfilePreviewPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen text-muted-foreground">
          Profile not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-6 pb-10">

        {/* HEADER */}
        <Card className="overflow-hidden bg-card border-border shadow-md">
          {/* Cover Image */}
          <div className="relative h-32 md:h-48">
            <img
              src={
                profile.banner_url ||
                "https://images.unsplash.com/photo-1557683316-973673baf926"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Avatar & Basic Info */}
          <div className="px-4 md:px-6 pb-6 -mt-14 md:-mt-20 relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {profile.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-4 space-y-2">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {profile.full_name}
                {profile.is_verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    Verified
                  </Badge>
                )}
              </h1>

              <p className="text-muted-foreground text-sm md:text-base">
                {profile.profession ||
                  profile.current_position ||
                  "Professional Account"}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </span>
                )}

                {profile.company_name && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {profile.company_name}
                  </span>
                )}

                {profile.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* BIO */}
        <Card className="bg-card border-border">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              {profile.bio ||
                profile.about ||
                "No bio added yet."}
            </p>
          </CardContent>
        </Card>

        {/* CONTACT */}
        <Card className="bg-card border-border">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 md:px-6">

            {profile.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            {profile.linkedin_url && (
              <div className="flex items-center gap-2 text-sm">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* POSTS */}
        <Card className="bg-card border-border">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg">
              Posts ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No posts available.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <p className="text-sm text-foreground">{post.content}</p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="rounded-lg max-h-96 object-cover w-full"
                    />
                  )}

                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePreviewPage;
