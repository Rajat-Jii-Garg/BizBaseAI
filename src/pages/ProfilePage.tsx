
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit, MapPin, Briefcase, Users, Eye, Globe, Mail, Phone, 
  Calendar, Building2, GraduationCap, Award, MessageSquare,
  Heart, Share2, ExternalLink, Github, Twitter, Linkedin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditor from '@/components/ProfileEditor';
import PostCard from '@/components/PostCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(full_name, avatar_url)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setUserPosts(postsData || []);

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_addressee_id_fkey(id, full_name, avatar_url, current_position)
        `)
        .eq('requester_id', user?.id)
        .eq('status', 'accepted');

      if (connectionsError) throw connectionsError;
      setConnections(connectionsData || []);

    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user?.id });
      }

      // Refresh posts
      fetchProfileData();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSharePost = async (postId: string) => {
    try {
      await supabase
        .from('post_shares')
        .insert({ post_id: postId, user_id: user?.id });
      
      toast({
        title: "Post Shared",
        description: "Post has been shared successfully.",
      });
      
      fetchProfileData();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditing) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <ProfileEditor
            profile={profile}
            onSave={() => {
              setIsEditing(false);
              fetchProfileData();
            }}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <Avatar className="h-32 w-32 ring-4 ring-white/20 shadow-2xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-4xl font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold">
                    {profile?.full_name || 'Professional User'}
                  </h1>
                  {profile?.profile_completed && (
                    <Badge className="bg-green-500 text-white">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                {profile?.current_position && (
                  <p className="text-xl text-white/90 mb-2">
                    {profile.current_position}
                    {profile?.company_name && ` at ${profile.company_name}`}
                  </p>
                )}

                {profile?.bio && (
                  <p className="text-white/80 mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile?.industry && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {profile.industry}
                    </div>
                  )}
                  {profile?.experience_years > 0 && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {profile.experience_years}+ years experience
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {connections.length} connections
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="connections">Connections ({connections.length})</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Skills */}
                {profile?.skills && profile.skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {profile?.education && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{profile.education}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {/* Profile Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      Profile Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profile Views</span>
                      <span className="font-semibold">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Post Impressions</span>
                      <span className="font-semibold">{userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Network Reach</span>
                      <span className="font-semibold">{connections.length * 12}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Links */}
                {(profile?.website || profile?.linkedin_url || profile?.twitter_url || profile?.github_url) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile?.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center text-blue-600 hover:text-blue-800">
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center text-blue-600 hover:text-blue-800">
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                      {profile?.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center text-blue-600 hover:text-blue-800">
                          <Twitter className="w-4 h-4 mr-2" />
                          Twitter
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                      {profile?.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center text-blue-600 hover:text-blue-800">
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {userPosts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                  <p className="text-gray-600">Start sharing your thoughts and insights with your network!</p>
                </CardContent>
              </Card>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onShare={handleSharePost}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 mt-6">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connections Yet</h3>
                  <p className="text-gray-600">Start building your professional network!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <Card key={connection.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.profiles?.avatar_url} />
                          <AvatarFallback>
                            {connection.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{connection.profiles?.full_name}</h3>
                          {connection.profiles?.current_position && (
                            <p className="text-sm text-gray-600">{connection.profiles.current_position}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.company_name && (
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-500" />
                    <span>{profile.company_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
