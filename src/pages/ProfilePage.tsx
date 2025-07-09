import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Edit,
  Save,
  X,
  Plus,
  Star,
  Award,
  Calendar,
  Link as LinkIcon,
  Camera,
  Crown,
  TrendingUp,
  Target,
  Zap,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileScore, setProfileScore] = useState(65);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    business_type: '',
    avatar_url: '',
    bio: '',
    location: '',
    website: '',
    linkedin_url: '',
    twitter_url: '',
    github_url: '',
    current_position: '',
    industry: '',
    education: '',
    experience_years: 0,
    skills: [] as string[],
    achievements: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
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

      if (data) {
        // Helper function to safely convert Json to string array
        const safeJsonToStringArray = (jsonData: any): string[] => {
          if (!jsonData) return [];
          if (Array.isArray(jsonData)) {
            return jsonData.filter(item => typeof item === 'string');
          }
          return [];
        };

        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          business_type: data.business_type || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          github_url: data.github_url || '',
          current_position: data.current_position || '',
          industry: data.industry || '',
          education: data.education || '',
          experience_years: data.experience_years || 0,
          skills: safeJsonToStringArray(data.skills),
          achievements: safeJsonToStringArray(data.achievements)
        });
        
        calculateProfileScore(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const calculateProfileScore = (profileData: any) => {
    let score = 0;
    const fields = ['full_name', 'phone', 'company_name', 'business_type', 'bio', 'location', 'current_position', 'industry', 'education'];
    
    fields.forEach(field => {
      if (profileData[field]) score += 8;
    });
    
    if (profileData.skills?.length > 0) score += 10;
    if (profileData.achievements?.length > 0) score += 10;
    if (profileData.website) score += 5;
    if (profileData.linkedin_url) score += 5;
    
    setProfileScore(Math.min(score, 100));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          company_name: profile.company_name,
          business_type: profile.business_type,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url,
          github_url: profile.github_url,
          current_position: profile.current_position,
          industry: profile.industry,
          education: profile.education,
          experience_years: profile.experience_years,
          skills: profile.skills,
          achievements: profile.achievements,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated and saved to database."
      });

      setIsEditing(false);
      calculateProfileScore(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !profile.achievements.includes(newAchievement.trim())) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievementToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement !== achievementToRemove)
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Enhanced Profile Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl overflow-hidden">
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
            {isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 text-white hover:bg-white/20"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-2xl font-bold">
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isEditing ? (
                    <Input
                      value={profile.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="text-2xl font-bold w-auto"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900">
                      {profile.full_name || 'Professional User'}
                    </h2>
                  )}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Elite
                  </Badge>
                </div>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <Input
                      value={profile.current_position}
                      onChange={(e) => handleInputChange('current_position', e.target.value)}
                      placeholder="Current Position"
                    />
                    <Input
                      value={profile.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Company Name"
                    />
                    <Input
                      value={profile.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="Industry"
                    />
                    <Input
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Location"
                    />
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    <p className="text-lg text-gray-600">
                      {profile.current_position && `${profile.current_position}`}
                      {profile.company_name && ` at ${profile.company_name}`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {profile.industry && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {profile.industry}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Customize Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
                    className="min-h-[120px] resize-none"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio || 'Add a bio to tell others about yourself and your professional journey.'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <X 
                            className="w-3 h-3 cursor-pointer hover:text-red-500" 
                            onClick={() => removeSkill(skill)}
                          />
                        )}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Add skills to showcase your expertise</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            {isEditing && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Experience Years</label>
                      <Input
                        type="number"
                        value={profile.experience_years}
                        onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                        placeholder="Years of experience"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Business Type</label>
                      <Input
                        value={profile.business_type}
                        onChange={(e) => handleInputChange('business_type', e.target.value)}
                        placeholder="e.g., Technology, Finance"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Education</label>
                    <Input
                      value={profile.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      placeholder="Your educational background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Your phone number"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {isEditing && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-purple-600" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                      <Input
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn</label>
                      <Input
                        value={profile.linkedin_url}
                        onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Twitter</label>
                      <Input
                        value={profile.twitter_url}
                        onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">GitHub</label>
                      <Input
                        value={profile.github_url}
                        onChange={(e) => handleInputChange('github_url', e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Progress */}
          <div className="space-y-6">
            {/* Profile Score */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Profile Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{profileScore}/100</div>
                  <p className="text-sm text-gray-600">Complete your profile to reach 100!</p>
                </div>
                <Progress value={profileScore} className="h-3 mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Info</span>
                    <span className="font-semibold">{profile.full_name && profile.phone && profile.location ? '✓' : '○'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Details</span>
                    <span className="font-semibold">{profile.current_position && profile.company_name ? '✓' : '○'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skills & Bio</span>
                    <span className="font-semibold">{profile.skills.length > 0 && profile.bio ? '✓' : '○'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Add an achievement"
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                    />
                    <Button onClick={addAchievement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {profile.achievements.length > 0 ? (
                    profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                        <span className="text-sm">{achievement}</span>
                        {isEditing && (
                          <X 
                            className="w-4 h-4 cursor-pointer hover:text-red-500" 
                            onClick={() => removeAchievement(achievement)}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Add achievements to showcase your accomplishments</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-bold text-blue-600">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connections</span>
                  <span className="font-bold text-green-600">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Posts</span>
                  <span className="font-bold text-purple-600">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Engagement Rate</span>
                  <span className="font-bold text-orange-600">89%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
