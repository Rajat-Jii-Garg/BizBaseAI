
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus,
  Mail,
  Phone,
  Globe,
  LinkedinIcon,
  TwitterIcon,
  Star,
  BookOpen,
  Award,
  Edit3,
  Camera,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PostCard from '@/components/PostCard';
import { usePosts } from '@/hooks/usePosts';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { posts, refreshPosts } = usePosts();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [profile, setProfile] = useState({
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    avatar_url: null,
    bio: 'Experienced software engineer with a passion for building scalable web applications.',
    current_position: 'Senior Software Engineer',
    company_name: 'Tech Solutions Inc.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    twitter_url: 'https://twitter.com/johndoe',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience_years: 5,
    education: 'BS Computer Science',
    certifications: ['AWS Certified', 'Google Cloud Professional']
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none');

  useEffect(() => {
    if (userId && user) {
      setIsOwnProfile(userId === user.id);
      fetchUserProfile();
      fetchUserPosts();
      checkConnectionStatus();
    } else if (user) {
      setIsOwnProfile(true);
      fetchCurrentUserProfile();
      fetchUserPosts();
    }
  }, [userId, user]);

  const fetchCurrentUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            avatar_url,
            current_position,
            company_name
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get likes count for each post
      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          
          const { count: commentsCount } = await supabase
            .from('post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { count: sharesCount } = await supabase
            .from('post_shares')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if current user liked this post
          let userHasLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .single();
            userHasLiked = !!likeData;
          }

          return {
            ...post,
            likes_count: count || 0,
            comments_count: commentsCount || 0,
            shares_count: sharesCount || 0,
            user_has_liked: userHasLiked
          };
        })
      );

      setUserPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setLoadingPosts(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!userId || !user || userId === user.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConnectionStatus(data.status);
        setIsConnected(data.status === 'accepted');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnect = async () => {
    if (!userId || !user) return;

    try {
      const { error } = await supabase
        .from('connections')
        .insert([
          {
            requester_id: user.id,
            addressee_id: userId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      setConnectionStatus('pending');
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully."
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully!"
      });

      // Refresh profile
      if (isOwnProfile) {
        fetchCurrentUserProfile();
      } else {
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Cover banner updated successfully!"
      });

      // Refresh profile
      if (isOwnProfile) {
        fetchCurrentUserProfile();
      } else {
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Error",
        description: "Failed to upload cover banner",
        variant: "destructive"
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="relative">
            {/* Cover Banner */}
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg overflow-hidden">
              {profile?.banner_url && (
                <img 
                  src={profile.banner_url} 
                  alt="Cover Banner" 
                  className="w-full h-full object-cover"
                />
              )}
              {isOwnProfile && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Edit Cover
                      </>
                    )}
                  </Button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full p-0 bg-white hover:bg-gray-100 text-gray-900 border-2 border-white shadow-lg"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile?.full_name || 'Professional User'}
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  {profile?.current_position || 'Professional'}
                  {profile?.company_name && ` at ${profile.company_name}`}
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{profile?.location || 'Location not specified'}</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isOwnProfile && (
                  <>
                    {connectionStatus === 'none' && (
                      <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                    {connectionStatus === 'pending' && (
                      <Button disabled variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request Sent
                      </Button>
                    )}
                    {connectionStatus === 'accepted' && (
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    )}
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className="text-gray-700 mb-4">{profile.bio}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {profile?.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Professional Details</h3>
                <div className="space-y-2">
                  {profile?.experience_years && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span>{profile.experience_years} years experience</span>
                    </div>
                  )}
                  {profile?.education && (
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{profile.education}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile?.certifications && profile.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="border-green-200 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {loadingPosts ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading posts...</p>
                </CardContent>
              </Card>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onEngagementUpdate={fetchUserPosts}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">No posts yet</p>
                  {isOwnProfile && (
                    <p className="text-sm text-gray-500 mt-2">
                      Start sharing your thoughts and insights!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">
                    {profile?.bio || 'No bio available'}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span>
                      {profile?.current_position || 'Position not specified'}
                      {profile?.company_name && ` at ${profile.company_name}`}
                    </span>
                  </div>
                  {profile?.experience_years && (
                    <p className="text-gray-600 text-sm mt-1">
                      {profile.experience_years} years of experience
                    </p>
                  )}
                </div>

                {profile?.education && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                    <div className="flex items-center text-gray-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{profile.education}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile?.location || 'Location not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Activity feed coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
