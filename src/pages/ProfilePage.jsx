// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { 
//   MapPin, 
//   Briefcase, 
//   Calendar, 
//   Users, 
//   MessageCircle, 
//   UserPlus,
//   Mail,
//   Phone,
//   Globe,
//   LinkedinIcon,
//   TwitterIcon,
//   Star,
//   BookOpen,
//   Award,
//   Edit3,
//   Camera,
//   Loader2
// } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import PostCard from '@/components/PostCard';
// import { usePosts } from '@/hooks/usePosts';

// const ProfilePage = () => {
//   const { userId } = useParams();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const { posts, refreshPosts } = usePosts();
//   const avatarInputRef = useRef(null);
//   const bannerInputRef = useRef(null);
  
//   const [loading, setLoading] = useState(false);
//   const [isOwnProfile, setIsOwnProfile] = useState(true);
//   const [userPosts, setUserPosts] = useState([]);
//   const [loadingPosts, setLoadingPosts] = useState(false);
//   const [uploadingAvatar, setUploadingAvatar] = useState(false);
//   const [uploadingBanner, setUploadingBanner] = useState(false);
//   const [profile, setProfile] = useState({
//     full_name: 'John Doe',
//     email: 'john@example.com',
//     phone: '+1 234 567 8900',
//     avatar_url: null,
//     bio: 'Experienced software engineer with a passion for building scalable web applications.',
//     current_position: 'Senior Software Engineer',
//     company_name: 'Tech Solutions Inc.',
//     location: 'San Francisco, CA',
//     website: 'https://johndoe.dev',
//     linkedin_url: 'https://linkedin.com/in/johndoe',
//     twitter_url: 'https://twitter.com/johndoe',
//     skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
//     experience_years: 5,
//     education: 'BS Computer Science',
//     certifications: ['AWS Certified', 'Google Cloud Professional']
//   });
  
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState('none');

//   useEffect(() => {
//   if (!user) return;

//   if (userId) {
//     setIsOwnProfile(userId === user.id);
//     fetchUserProfile();
//     fetchUserPosts();
//     checkConnectionStatus();
//   } else {
//     setIsOwnProfile(true);
//     fetchCurrentUserProfile();
//     fetchUserPosts();
//   }
// }, [userId, user]);

//   const fetchCurrentUserProfile = async () => {
//     if (!user) return;
    
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', user.id)
//         .single();

//       if (error && error.code !== 'PGRST116') {
//         throw error;
//       }

//       if (data) {
//         setProfile(data);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load profile",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserProfile = async () => {
//     if (!userId) return;
    
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single();

//       if (error) {
//         throw error;
//       }

//       setProfile(data);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load user profile",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUserPosts = async () => {
//     const targetUserId = userId || user?.id;
//     if (!targetUserId) return;

//     try {
//       setLoadingPosts(true);
//       const { data, error } = await supabase
//         .from('posts')
//         .select(`
//           *,
//           profiles!posts_user_id_fkey (
//             full_name,
//             avatar_url,
//             current_position,
//             company_name
//           )
//         `)
//         .eq('user_id', targetUserId)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       // Get likes count for each post
//       const postsWithLikes = await Promise.all(
//         (data || []).map(async (post) => {
//           const { count } = await supabase
//             .from('post_likes')
//             .select('*', { count: 'exact', head: true })
//             .eq('post_id', post.id);
          
//           const { count: commentsCount } = await supabase
//             .from('post_comments')
//             .select('*', { count: 'exact', head: true })
//             .eq('post_id', post.id);

//           const { count: sharesCount } = await supabase
//             .from('post_shares')
//             .select('*', { count: 'exact', head: true })
//             .eq('post_id', post.id);

//           // Check if current user liked this post
//           let userHasLiked = false;
//           if (user) {
//             const { data: likeData } = await supabase
//               .from('post_likes')
//               .select('id')
//               .eq('post_id', post.id)
//               .eq('user_id', user.id)
//               .single();
//             userHasLiked = !!likeData;
//           }

//           return {
//             ...post,
//             likes_count: count || 0,
//             comments_count: commentsCount || 0,
//             shares_count: sharesCount || 0,
//             user_has_liked: userHasLiked
//           };
//         })
//       );

//       setUserPosts(postsWithLikes);
//     } catch (error) {
//       console.error('Error fetching user posts:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load posts",
//         variant: "destructive"
//       });
//     } finally {
//       setLoadingPosts(false);
//     }
//   };

//   const checkConnectionStatus = async () => {
//     if (!userId || !user || userId === user.id) return;

//     try {
//       const { data, error } = await supabase
//         .from('connections')
//         .select('status')
//         .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
//         .single();

//       if (error && error.code !== 'PGRST116') {
//         throw error;
//       }

//       if (data) {
//         setConnectionStatus(data.status);
//         setIsConnected(data.status === 'accepted');
//       }
//     } catch (error) {
//       console.error('Error checking connection status:', error);
//     }
//   };

//   const handleConnect = async () => {
//     if (!userId || !user) return;

//     try {
//       const { error } = await supabase
//         .from('connections')
//         .insert([
//           {
//             requester_id: user.id,
//             addressee_id: userId,
//             status: 'pending'
//           }
//         ]);

//       if (error) throw error;

//       setConnectionStatus('pending');
//       toast({
//         title: "Connection Request Sent",
//         description: "Your connection request has been sent successfully."
//       });
//     } catch (error) {
//       console.error('Error sending connection request:', error);
//       toast({
//         title: "Error",
//         description: "Failed to send connection request",
//         variant: "destructive"
//       });
//     }
//   };

//   const handleAvatarUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file || !user) return;

//     setUploadingAvatar(true);
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${user.id}/avatar.${fileExt}`;
//       const filePath = `${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('avatars')
//         .upload(filePath, file, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('avatars')
//         .getPublicUrl(filePath);

//       const { error: updateError } = await supabase
//         .from('profiles')
//         .update({ avatar_url: publicUrl })
//         .eq('id', user.id);

//       if (updateError) throw updateError;

//       toast({
//         title: "Success",
//         description: "Profile picture updated successfully!"
//       });

//       // Refresh profile
//       if (isOwnProfile) {
//         fetchCurrentUserProfile();
//       } else {
//         fetchUserProfile();
//       }
//     } catch (error) {
//       console.error('Error uploading avatar:', error);
//       toast({
//         title: "Error",
//         description: "Failed to upload profile picture",
//         variant: "destructive"
//       });
//     } finally {
//       setUploadingAvatar(false);
//     }
//   };

//   const handleBannerUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file || !user) return;

//     setUploadingBanner(true);
//     try {
//       const fileExt = file.name.split('.').pop();
//       const fileName = `${user.id}/banner.${fileExt}`;
//       const filePath = `${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from('avatars')
//         .upload(filePath, file, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('avatars')
//         .getPublicUrl(filePath);

//       const { error: updateError } = await supabase
//         .from('profiles')
//         .update({ banner_url: publicUrl })
//         .eq('id', user.id);

//       if (updateError) throw updateError;

//       toast({
//         title: "Success",
//         description: "Cover banner updated successfully!"
//       });

//       // Refresh profile
//       if (isOwnProfile) {
//         fetchCurrentUserProfile();
//       } else {
//         fetchUserProfile();
//       }
//     } catch (error) {
//       console.error('Error uploading banner:', error);
//       toast({
//         title: "Error",
//         description: "Failed to upload cover banner",
//         variant: "destructive"
//       });
//     } finally {
//       setUploadingBanner(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto py-8 px-4">
//         {/* Profile Header */}
//         <Card className="mb-6">
//           <div className="relative">
//             {/* Cover Banner */}
//             <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg overflow-hidden">
//               {profile?.banner_url && (
//                 <img 
//                   src={profile.banner_url} 
//                   alt="Cover Banner" 
//                   className="w-full h-full object-cover"
//                 />
//               )}
//               {isOwnProfile && (
//                 <>
//                   <Button
//                     type="button"
//                     size="sm"
//                     variant="secondary"
//                     className="absolute top-2 right-2 bg-white/90 hover:bg-white"
//                     onClick={() => bannerInputRef.current?.click()}
//                     disabled={uploadingBanner}
//                   >
//                     {uploadingBanner ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <>
//                         <Camera className="h-4 w-4 mr-2" />
//                         Edit Cover
//                       </>
//                     )}
//                   </Button>
//                   <input
//                     ref={bannerInputRef}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleBannerUpload}
//                     className="hidden"
//                   />
//                 </>
//               )}
//             </div>

//             {/* Profile Avatar */}
//             <div className="absolute -bottom-16 left-8">
//               <div className="relative">
//                 <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
//                   <AvatarImage src={profile?.avatar_url} />
//                   <AvatarFallback className="text-2xl">
//                     {profile?.full_name?.charAt(0) || 'U'}
//                   </AvatarFallback>
//                 </Avatar>
//                 {isOwnProfile && (
//                   <>
//                     <Button
//                       type="button"
//                       size="sm"
//                       className="absolute bottom-0 right-0 h-10 w-10 rounded-full p-0 bg-white hover:bg-gray-100 text-gray-900 border-2 border-white shadow-lg"
//                       onClick={() => avatarInputRef.current?.click()}
//                       disabled={uploadingAvatar}
//                     >
//                       {uploadingAvatar ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         <Camera className="h-4 w-4" />
//                       )}
//                     </Button>
//                     <input
//                       ref={avatarInputRef}
//                       type="file"
//                       accept="image/*"
//                       onChange={handleAvatarUpload}
//                       className="hidden"
//                     />
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           <CardContent className="pt-20 pb-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//               <div className="mb-4 md:mb-0">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   {profile?.full_name || 'Professional User'}
//                 </h1>
//                 <p className="text-lg text-gray-600 mb-2">
//                   {profile?.current_position || 'Professional'}
//                   {profile?.company_name && ` at ${profile.company_name}`}
//                 </p>
//                 <div className="flex items-center text-gray-500 text-sm">
//                   <MapPin className="w-4 h-4 mr-1" />
//                   <span>{profile?.location || 'Location not specified'}</span>
//                 </div>
//               </div>
              
//               <div className="flex space-x-3">
//                 {!isOwnProfile && (
//                   <>
//                     {connectionStatus === 'none' && (
//                       <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
//                         <UserPlus className="w-4 h-4 mr-2" />
//                         Connect
//                       </Button>
//                     )}
//                     {connectionStatus === 'pending' && (
//                       <Button disabled variant="outline">
//                         <UserPlus className="w-4 h-4 mr-2" />
//                         Request Sent
//                       </Button>
//                     )}
//                     {connectionStatus === 'accepted' && (
//                       <Button variant="outline">
//                         <MessageCircle className="w-4 h-4 mr-2" />
//                         Message
//                       </Button>
//                     )}
//                   </>
//                 )}
//                 {isOwnProfile && (
//                   <Button variant="outline" onClick={() => window.location.href = '/settings'}>
//                     <Edit3 className="w-4 h-4 mr-2" />
//                     Edit Profile
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {profile?.bio && (
//               <p className="text-gray-700 mb-4">{profile.bio}</p>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
//                 <div className="space-y-2">
//                   {profile?.email && (
//                     <div className="flex items-center text-gray-600">
//                       <Mail className="w-4 h-4 mr-2" />
//                       <span>{profile.email}</span>
//                     </div>
//                   )}
//                   {profile?.phone && (
//                     <div className="flex items-center text-gray-600">
//                       <Phone className="w-4 h-4 mr-2" />
//                       <span>{profile.phone}</span>
//                     </div>
//                   )}
//                   {profile?.website && (
//                     <div className="flex items-center text-gray-600">
//                       <Globe className="w-4 h-4 mr-2" />
//                       <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                         {profile.website}
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-semibold text-gray-900 mb-3">Professional Details</h3>
//                 <div className="space-y-2">
//                   {profile?.experience_years && (
//                     <div className="flex items-center text-gray-600">
//                       <Briefcase className="w-4 h-4 mr-2" />
//                       <span>{profile.experience_years} years experience</span>
//                     </div>
//                   )}
//                   {profile?.education && (
//                     <div className="flex items-center text-gray-600">
//                       <BookOpen className="w-4 h-4 mr-2" />
//                       <span>{profile.education}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {profile?.skills && profile.skills.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {profile.skills.map((skill, index) => (
//                     <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {profile?.certifications && profile.certifications.length > 0 && (
//               <div className="mt-6">
//                 <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {profile.certifications.map((cert, index) => (
//                     <Badge key={index} variant="outline" className="border-green-200 text-green-800">
//                       <Award className="w-3 h-3 mr-1" />
//                       {cert}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Profile Content Tabs */}
//         <Tabs defaultValue="posts" className="w-full">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="posts">Posts</TabsTrigger>
//             <TabsTrigger value="about">About</TabsTrigger>
//             <TabsTrigger value="activity">Activity</TabsTrigger>
//           </TabsList>

//           <TabsContent value="posts" className="space-y-6">
//             {loadingPosts ? (
//               <Card>
//                 <CardContent className="p-8 text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                   <p className="text-gray-600">Loading posts...</p>
//                 </CardContent>
//               </Card>
//             ) : userPosts.length > 0 ? (
//               userPosts.map((post) => (
//                 <PostCard 
//                   key={post.id} 
//                   post={post} 
//                   onEngagementUpdate={fetchUserPosts}
//                 />
//               ))
//             ) : (
//               <Card>
//                 <CardContent className="p-8 text-center">
//                   <p className="text-gray-600">No posts yet</p>
//                   {isOwnProfile && (
//                     <p className="text-sm text-gray-500 mt-2">
//                       Start sharing your thoughts and insights!
//                     </p>
//                   )}
//                 </CardContent>
//               </Card>
//             )}
//           </TabsContent>

//           <TabsContent value="about">
//             <Card>
//               <CardHeader>
//                 <CardTitle>About</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
//                   <p className="text-gray-700">
//                     {profile?.bio || 'No bio available'}
//                   </p>
//                 </div>

//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
//                   <div className="flex items-center text-gray-700">
//                     <Briefcase className="w-4 h-4 mr-2" />
//                     <span>
//                       {profile?.current_position || 'Position not specified'}
//                       {profile?.company_name && ` at ${profile.company_name}`}
//                     </span>
//                   </div>
//                   {profile?.experience_years && (
//                     <p className="text-gray-600 text-sm mt-1">
//                       {profile.experience_years} years of experience
//                     </p>
//                   )}
//                 </div>

//                 {profile?.education && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
//                     <div className="flex items-center text-gray-700">
//                       <BookOpen className="w-4 h-4 mr-2" />
//                       <span>{profile.education}</span>
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
//                   <div className="flex items-center text-gray-700">
//                     <MapPin className="w-4 h-4 mr-2" />
//                     <span>{profile?.location || 'Location not specified'}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="activity">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Recent Activity</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-600">Activity feed coming soon...</p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;




import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditModal from '@/components/ProfileEditModal';
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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDashboard = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('about');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    mentions: 0,
    reposts: 0,
    articles: 0,
    saved: 0,
    totalEngagement: 0
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchPosts();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [connectionsRes, postsRes] = await Promise.all([
        supabase
          .from('connections')
          .select('id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted'),
        supabase
          .from('posts')
          .select('likes_count, comments_count, shares_count')
          .eq('user_id', user.id)
      ]);

      const totalEngagement = postsRes.data?.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0), 0) || 0;

      setStats({
        connections: connectionsRes.data?.length || 0,
        posts: postsRes.data?.length || 0,
        mentions: 12,
        reposts: 8,
        articles: 6,
        saved: 5,
        totalEngagement: totalEngagement || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      
      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setPostsLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, company_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Get like status for current user
      const postIds = postsData.map(post => post.id);
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

      // Combine data
      const enrichedPosts = postsData.map(post => ({
        ...post,
        profiles: profileData || {
          full_name: 'Professional User',
          avatar_url: null,
          current_position: null,
          company_name: null
        },
        user_has_liked: likedPostIds.has(post.id)
      }));

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive'
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updateField = type === 'avatar' ? 'avatar_url' : 'banner_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Profile photo' : 'Cover image'} updated successfully`
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Link copied!',
      description: 'Profile link copied to clipboard'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-6">
        {/* Profile Header */}
        <Card className="overflow-hidden bg-card border-border shadow-lg">
          {/* Cover Image */}
          <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20">
            <img
              src={profile?.banner_url || 'https://images.unsplash.com/photo-1557683316-973673baf926'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                <Users className="w-3 h-3 mr-1" />
                {stats.connections} Connections
              </Badge>
              <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                Pro Member
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 md:top-4 right-2 md:right-4 bg-background/80 backdrop-blur-sm hover:bg-background text-xs md:text-sm"
              onClick={() => document.getElementById('banner-upload').click()}
              disabled={uploading}
            >
              <Camera className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Edit Cover</span>
            </Button>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
            />
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16 relative">
              {/* Avatar */}
              <div className="relative mb-4 md:mb-0">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full shadow-md hover:shadow-lg h-8 w-8"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={uploading}
                >
                  <Camera className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-green-500 rounded-full border-2 border-background" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'avatar')}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" onClick={handleShare} size="sm" className="flex-1 md:flex-none">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => navigate(`/profile/preview/${user.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-4 space-y-3">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                  {profile?.full_name || 'Professional User'}
                  {profile?.is_verified && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mt-1">
                  {profile?.profession || profile?.current_position || 'Senior Product Manager & Digital Innovation Leader'}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.company_name && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                      {profile.company_name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    Joined {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 p-3 md:p-4 bg-muted/30 rounded-lg">
                {profile?.email && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Mail className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground truncate">{profile.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Phone className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{profile.phone}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Globe className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile?.linkedin_url && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Linkedin className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border lg:sticky lg:top-20">
              <CardHeader className="pb-3 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profile Navigation</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Explore content sections</p>
              </CardHeader>
              <CardContent className="p-0 px-2 md:px-0">
                <div className="space-y-1">
                  <Button
                    variant={activeSection === 'about' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('about')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    About
                  </Button>
                  <Button
                    variant={activeSection === 'posts' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('posts')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Posts
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.posts}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'mentions' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('mentions')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mentions
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.mentions}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'reposts' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('reposts')}
                  >
                    <Repeat2 className="w-4 h-4 mr-2" />
                    Reposts
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.reposts}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'articles' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('articles')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Articles
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.articles}</Badge>
                  </Button>
                  <Button
                    variant={activeSection === 'saved' ? 'default' : 'ghost'}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveSection('saved')}
                  >
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                    <Badge variant="secondary" className="ml-auto text-xs">{stats.saved}</Badge>
                  </Button>
                  
                  <Separator className="my-2" />
                  
                  <ProfileEditModal onProfileUpdate={fetchProfile}>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </ProfileEditModal>
                </div>
                
                <Separator className="my-4" />
                
                <div className="px-4 py-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Engagement</p>
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stats.totalEngagement.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* About Section */}
            {activeSection === 'about' && (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <User className="w-4 h-4 md:w-5 md:h-5" />
                    About
                  </CardTitle>
                  <ProfileEditModal onProfileUpdate={fetchProfile}>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </ProfileEditModal>
                </CardHeader>
                <CardContent className="space-y-4 px-4 md:px-6">
                  <p className="text-foreground leading-relaxed text-sm md:text-base">
                    {profile?.bio || profile?.about || 'Passionate product manager with 8+ years of experience driving digital transformation at Fortune 500 companies. I specialize in building user-centered products that solve real-world problems and deliver measurable business impact. Currently leading cross-functional teams to develop next-generation SaaS solutions that empower businesses to scale efficiently. My expertise spans across agile methodologies, user experience design, data analytics, and strategic planning. I believe in fostering collaborative environments where innovation thrives and teams can achieve extraordinary results.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">#ProductManagement</Badge>
                    <Badge variant="secondary" className="text-xs">#Innovation</Badge>
                    <Badge variant="secondary" className="text-xs">#Leadership</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Section */}
            {activeSection === 'posts' && (
              <Card className="bg-card border-border">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="text-base md:text-lg">Recent Posts ({stats.posts})</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  {postsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <div key={post.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/public-profile/${post.user_id}`)}>
                              <AvatarImage src={post.profiles?.avatar_url || profile?.avatar_url} />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {post.profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm cursor-pointer transition-colors" onClick={() => navigate(`/public-profile/${post.user_id}`)}>{post.profiles?.full_name || profile?.full_name}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{post.profiles?.current_position || profile?.current_position}</p>
                            </div>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                          {post.image_url && (
                            <img 
                              src={post.image_url} 
                              alt="Post" 
                              className="w-full rounded-lg max-h-96 object-cover"
                            />
                          )}
                          <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {post.comments_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Repeat2 className="w-4 h-4" />
                              {post.shares_count || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 md:py-12 text-muted-foreground">
                      <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm md:text-base">No posts yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => navigate('/feed')}
                      >
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Other sections */}
            {(activeSection === 'mentions' || activeSection === 'reposts' || activeSection === 'articles' || activeSection === 'saved') && (
              <Card className="bg-card border-border">
                <CardHeader className="px-4 md:px-6">
                  <CardTitle className="capitalize text-base md:text-lg">{activeSection}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="text-center py-8 md:py-12 text-muted-foreground">
                    <p className="text-sm md:text-base">No {activeSection} yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileDashboard;
