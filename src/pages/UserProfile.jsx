import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Share2, MapPin, Calendar, Mail, Phone, Globe, 
  Linkedin, Camera, Edit3, Award, TrendingUp, Eye,
  FileText, MessageCircle, Repeat2, BookOpen, Bookmark,
  Settings, Briefcase, GraduationCap, Languages, 
  ShieldCheck, ExternalLink, Plus
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch all profile data
  useEffect(() => {
    if (userId || user?.id) {
      const profileId = userId || user?.id;
      setIsOwnProfile(!userId || userId === user?.id);
      fetchProfileData(profileId);
    }
  }, [userId, user]);

  const fetchProfileData = async (profileId) => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Track profile view if not own profile
      if (!isOwnProfile && user?.id) {
        await supabase
          .from('profile_views')
          .insert({
            profile_user_id: profileId,
            viewer_user_id: user.id
          });
      }

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', profileId)
        .order('endorsements_count', { ascending: false });
      setSkills(skillsData || []);

      // Fetch experience
      const { data: experienceData } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', profileId)
        .order('start_date', { ascending: false });
      setExperience(experienceData || []);

      // Fetch education
      const { data: educationData } = await supabase
        .from('user_education')
        .select('*')
        .eq('user_id', profileId)
        .order('end_year', { ascending: false });
      setEducation(educationData || []);

      // Fetch certificates
      const { data: certificatesData } = await supabase
        .from('user_certificates')
        .select('*')
        .eq('user_id', profileId)
        .order('issue_date', { ascending: false });
      setCertificates(certificatesData || []);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profileId)
        .order('achievement_date', { ascending: false })
        .limit(3);
      setAchievements(achievementsData || []);

      // Fetch languages
      const { data: languagesData } = await supabase
        .from('user_languages')
        .select('*')
        .eq('user_id', profileId);
      setLanguages(languagesData || []);

      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(10);
      setPosts(postsData || []);

      // Count connections
      const { count } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`)
        .eq('status', 'accepted');
      setConnections(count || 0);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillProgress = (level) => {
    const levels = { 'Beginner': 25, 'Intermediate': 50, 'Advanced': 75, 'Expert': 100 };
    return levels[level] || 0;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Banner */}
          <div className="relative h-48 bg-gradient-to-r from-primary to-primary/70">
            {profile.banner_url && (
              <img 
                src={profile.banner_url} 
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">{connections}</span>
                <span className="text-xs text-muted-foreground">Connections</span>
              </div>
              {profile.subscription_plan === 'pro' && (
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Pro Member
                </Badge>
              )}
              {isOwnProfile && (
                <Button size="sm" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                  <Camera className="h-4 w-4 mr-1" />
                  Edit Cover
                </Button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <CardContent className="relative pt-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative -mt-16 mb-4">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-2 border-background rounded-full"></div>
                  {isOwnProfile && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute bottom-0 right-6 rounded-full p-2"
                    >
                      <Camera className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 pt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                      {profile.is_verified && (
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    {profile.nickname && (
                      <p className="text-muted-foreground mb-1">@{profile.nickname}</p>
                    )}
                    <p className="text-lg text-muted-foreground mb-2">
                      {profile.profession || profile.current_position}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </div>
                      )}
                      {profile.company_name && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {profile.company_name}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDate(profile.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!isOwnProfile ? (
                      <Button className="w-full md:w-auto">
                        <Users className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => navigate('/settings')}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                    <Button variant="outline" className="w-full md:w-auto">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.linkedin_url && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                         className="text-primary hover:underline">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Profile Navigation</h3>
                    <p className="text-xs text-muted-foreground">Explore content sections</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Button 
                    variant={activeTab === 'posts' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('posts')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Posts
                    <Badge variant="secondary" className="ml-auto">{posts.length}</Badge>
                  </Button>
                  <Button 
                    variant={activeTab === 'mentions' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('mentions')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mentions
                    <Badge variant="secondary" className="ml-auto">12</Badge>
                  </Button>
                  <Button 
                    variant={activeTab === 'reposts' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('reposts')}
                  >
                    <Repeat2 className="h-4 w-4 mr-2" />
                    Reposts
                    <Badge variant="secondary" className="ml-auto">8</Badge>
                  </Button>
                  <Button 
                    variant={activeTab === 'articles' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('articles')}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Articles
                    <Badge variant="secondary" className="ml-auto">6</Badge>
                  </Button>
                  <Button 
                    variant={activeTab === 'saved' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('saved')}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved
                    <Badge variant="secondary" className="ml-auto">5</Badge>
                  </Button>
                  {isOwnProfile && (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Profile Stats */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Profile Analytics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Engagement</span>
                      <span className="font-medium">2.4k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-medium text-green-600">+18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Profile Views</span>
                      <span className="font-medium">{profile.total_profile_views || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>About</span>
                </CardTitle>
                {isOwnProfile && (
                  <Button variant="ghost" size="sm">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {profile.about || profile.bio || "No description provided yet."}
                </p>
                {profile.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        #{skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Endorsements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Skills & Endorsements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.length > 0 ? skills.map((skill) => (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.skill_name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{skill.level}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {skill.endorsements_count} endorsements
                          </span>
                        </div>
                      </div>
                      <Progress value={getSkillProgress(skill.level)} className="h-2" />
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      No skills added yet
                    </p>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.length > 0 ? achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(achievement.achievement_date)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      No achievements yet
                    </p>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Achievement
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experience.length > 0 ? experience.map((exp) => (
                  <div key={exp.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.position}</h4>
                      <p className="text-primary font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      </p>
                      {exp.location && (
                        <p className="text-sm text-muted-foreground">{exp.location}</p>
                      )}
                      {exp.description && (
                        <p className="text-sm mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">
                    No experience added yet
                  </p>
                )}
                {isOwnProfile && (
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Education & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.length > 0 ? education.map((edu) => (
                    <div key={edu.id} className="space-y-2">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-primary font-medium">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {edu.start_year} - {edu.end_year}
                      </p>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      No education added yet
                    </p>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {certificates.length > 0 ? certificates.map((cert) => (
                    <div key={cert.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {cert.logo_url ? (
                          <img src={cert.logo_url} alt={cert.issuer} className="h-6 w-6" />
                        ) : (
                          <Award className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{cert.title}</h4>
                          {cert.is_verified && (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued {formatDate(cert.issue_date)}
                        </p>
                        {cert.credential_url && (
                          <a 
                            href={cert.credential_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Credential
                          </a>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-center py-4">
                      No certificates added yet
                    </p>
                  )}
                  {isOwnProfile && (
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certificate
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {languages.map((lang) => (
                      <div key={lang.id} className="text-center">
                        <h4 className="font-medium">{lang.language}</h4>
                        <Badge variant="outline">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                  {isOwnProfile && (
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Language
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Posts/Content Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <p className="mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{formatDate(post.created_at)}</span>
                          <div className="flex items-center gap-4">
                            <span>{post.likes_count || 0} likes</span>
                            <span>{post.comments_count || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Posts
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No posts yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;