import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, Trash2, Edit3, Upload, Calendar, MapPin, 
  Briefcase, GraduationCap, Award, Languages as LanguagesIcon,
  User, Mail, Phone, Globe, Linkedin, Camera, CheckCircle, XCircle, Loader2, AtSign
} from 'lucide-react';

const ProfileEditModal = ({ children, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Username availability state
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [originalUsername, setOriginalUsername] = useState('');

  // Profile data states
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    profession: '',
    bio: '',
    about: '',
    location: '',
    belongs_to: '',
    email: '',
    phone: '',
    website: '',
    linkedin_url: '',
    current_position: '',
    company_name: '',
    industry: ''
  });

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Form states for adding new items
  const [newSkill, setNewSkill] = useState({ skill_name: '', level: 'Beginner' });
  const [newExperience, setNewExperience] = useState({
    company: '', position: '', start_date: '', end_date: '', 
    is_current: false, description: '', location: ''
  });
  const [newEducation, setNewEducation] = useState({
    institution: '', degree: '', field_of_study: '', 
    start_year: '', end_year: '', grade: '', description: ''
  });
  const [newCertificate, setNewCertificate] = useState({
    title: '', issuer: '', issue_date: '', expiry_date: '',
    credential_id: '', credential_url: ''
  });
  const [newLanguage, setNewLanguage] = useState({ language: '', proficiency: 'Beginner' });
  const [newAchievement, setNewAchievement] = useState({
    title: '', description: '', achievement_date: '', category: 'General'
  });

  useEffect(() => {
    if (open && user?.id) {
      fetchProfileData();
    }
  }, [open, user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setOriginalUsername(profileData.username || '');
      }

      // Fetch all related data
      const [skillsRes, expRes, eduRes, certRes, langRes, achRes] = await Promise.all([
        supabase.from('user_skills').select('*').eq('user_id', user.id),
        supabase.from('user_experience').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
        supabase.from('user_education').select('*').eq('user_id', user.id).order('end_year', { ascending: false }),
        supabase.from('user_certificates').select('*').eq('user_id', user.id).order('issue_date', { ascending: false }),
        supabase.from('user_languages').select('*').eq('user_id', user.id),
        supabase.from('user_achievements').select('*').eq('user_id', user.id).order('achievement_date', { ascending: false })
      ]);

      setSkills(skillsRes.data || []);
      setExperience(expRes.data || []);
      setEducation(eduRes.data || []);
      setCertificates(certRes.data || []);
      setLanguages(langRes.data || []);
      setAchievements(achRes.data || []);

    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username || username.trim().length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // If same as original username, it's available for this user
    if (username.toLowerCase() === originalUsername?.toLowerCase()) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .rpc('is_username_available', { check_username: username });

      if (error) throw error;
      setUsernameAvailable(data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.username) {
        checkUsernameAvailability(profile.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profile.username, originalUsername]);

  const handleSaveProfile = async () => {
    // Check if username is being changed and is available
    if (profile.username && profile.username !== originalUsername && usernameAvailable === false) {
      toast({
        title: "Error",
        description: "Username is not available",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) {
        // Handle unique constraint error
        if (error.message?.includes('Username already taken')) {
          toast({
            title: "Error",
            description: "This username is already taken",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) return;

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({ ...newSkill, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewSkill({ skill_name: '', level: 'Beginner' });
      
      toast({
        title: "Success",
        description: "Skill added successfully"
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      const { error } = await supabase
        .from('user_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      setSkills(skills.filter(skill => skill.id !== skillId));
      
      toast({
        title: "Success",
        description: "Skill removed successfully"
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive"
      });
    }
  };

  const handleAddExperience = async () => {
    if (!newExperience.company.trim() || !newExperience.position.trim()) return;

    try {
      const { error } = await supabase
        .from('user_experience')
        .insert({ ...newExperience, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewExperience({
        company: '', position: '', start_date: '', end_date: '', 
        is_current: false, description: '', location: ''
      });
      
      toast({
        title: "Success",
        description: "Experience added successfully"
      });
    } catch (error) {
      console.error('Error adding experience:', error);
      toast({
        title: "Error",
        description: "Failed to add experience",
        variant: "destructive"
      });
    }
  };

  const handleAddEducation = async () => {
    if (!newEducation.institution.trim() || !newEducation.degree.trim()) return;

    try {
      const { error } = await supabase
        .from('user_education')
        .insert({ ...newEducation, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewEducation({
        institution: '', degree: '', field_of_study: '', 
        start_year: '', end_year: '', grade: '', description: ''
      });
      
      toast({
        title: "Success",
        description: "Education added successfully"
      });
    } catch (error) {
      console.error('Error adding education:', error);
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive"
      });
    }
  };

  const handleAddCertificate = async () => {
    if (!newCertificate.title.trim() || !newCertificate.issuer.trim()) return;

    try {
      const { error } = await supabase
        .from('user_certificates')
        .insert({ ...newCertificate, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewCertificate({
        title: '', issuer: '', issue_date: '', expiry_date: '',
        credential_id: '', credential_url: ''
      });
      
      toast({
        title: "Success",
        description: "Certificate added successfully"
      });
    } catch (error) {
      console.error('Error adding certificate:', error);
      toast({
        title: "Error",
        description: "Failed to add certificate",
        variant: "destructive"
      });
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.language.trim()) return;

    try {
      const { error } = await supabase
        .from('user_languages')
        .insert({ ...newLanguage, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewLanguage({ language: '', proficiency: 'Beginner' });
      
      toast({
        title: "Success",
        description: "Language added successfully"
      });
    } catch (error) {
      console.error('Error adding language:', error);
      toast({
        title: "Error",
        description: "Failed to add language",
        variant: "destructive"
      });
    }
  };

  const handleAddAchievement = async () => {
    if (!newAchievement.title.trim()) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({ ...newAchievement, user_id: user.id });

      if (error) throw error;

      await fetchProfileData();
      setNewAchievement({
        title: '', description: '', achievement_date: '', category: 'General'
      });
      
      toast({
        title: "Success",
        description: "Achievement added successfully"
      });
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast({
        title: "Error",
        description: "Failed to add achievement",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <AtSign className="h-4 w-4" />
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={profile.username || ''}
                    onChange={(e) => setProfile({...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                    placeholder="your_unique_username"
                    className={`pr-10 ${
                      usernameAvailable === true ? 'border-green-500 focus:ring-green-500' : 
                      usernameAvailable === false ? 'border-destructive focus:ring-destructive' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!checkingUsername && usernameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.username && (
                    <>
                      Your profile URL: <span className="font-medium">domain.com/@{profile.username}</span>
                      {usernameAvailable === false && <span className="text-destructive ml-2">• Username not available</span>}
                      {usernameAvailable === true && <span className="text-green-500 ml-2">• Username available</span>}
                    </>
                  )}
                  {!profile.username && 'Choose a unique username (lowercase letters, numbers, underscores only)'}
                </p>
              </div>
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={profile.profession || ''}
                  onChange={(e) => setProfile({...profile, profession: e.target.value})}
                  placeholder="e.g. Senior Product Manager"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({...profile, location: e.target.value})}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div>
                <Label htmlFor="current_position">Current Position</Label>
                <Input
                  id="current_position"
                  value={profile.current_position || ''}
                  onChange={(e) => setProfile({...profile, current_position: e.target.value})}
                  placeholder="Current job title"
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company</Label>
                <Input
                  id="company_name"
                  value={profile.company_name || ''}
                  onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                  placeholder="Current company"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website || ''}
                  onChange={(e) => setProfile({...profile, website: e.target.value})}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                placeholder="Brief description about yourself"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                value={profile.about || ''}
                onChange={(e) => setProfile({...profile, about: e.target.value})}
                placeholder="Detailed description about your professional background"
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Skill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    value={newSkill.skill_name}
                    onChange={(e) => setNewSkill({...newSkill, skill_name: e.target.value})}
                    placeholder="Skill name"
                    className="flex-1"
                  />
                  <Select
                    value={newSkill.level}
                    onValueChange={(value) => setNewSkill({...newSkill, level: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{skill.skill_name}</span>
                    <Badge variant="outline">{skill.level}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {skill.endorsements_count} endorsements
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({...newExperience, position: e.target.value})}
                    placeholder="Job title"
                  />
                  <Input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                    placeholder="Company name"
                  />
                  <Input
                    type="date"
                    value={newExperience.start_date}
                    onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={newExperience.end_date}
                    onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                    placeholder="End date"
                    disabled={newExperience.is_current}
                  />
                  <Input
                    value={newExperience.location}
                    onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                    placeholder="Location"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={newExperience.is_current}
                    onChange={(e) => setNewExperience({...newExperience, is_current: e.target.checked})}
                  />
                  <Label htmlFor="is_current">I currently work here</Label>
                </div>
                <Textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Job description"
                  rows={3}
                />
                <Button onClick={handleAddExperience} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {experience.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{exp.position}</h4>
                        <p className="text-primary font-medium">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">
                          {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                        </p>
                        {exp.location && (
                          <p className="text-sm text-muted-foreground">{exp.location}</p>
                        )}
                        {exp.description && (
                          <p className="text-sm mt-2">{exp.description}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Other tabs would follow similar patterns */}
          <TabsContent value="education" className="space-y-4">
            <p className="text-muted-foreground">Education section coming soon...</p>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <p className="text-muted-foreground">Certificates section coming soon...</p>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <p className="text-muted-foreground">Achievements section coming soon...</p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
