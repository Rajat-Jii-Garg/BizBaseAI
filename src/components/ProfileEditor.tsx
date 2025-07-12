
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { X, Plus, Save, Camera, Upload, Star, Briefcase, MapPin, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileEditorProps {
  profile: any;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onSave, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    twitter_url: profile?.twitter_url || '',
    github_url: profile?.github_url || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    current_position: profile?.current_position || '',
    industry: profile?.industry || '',
    education: profile?.education || '',
    experience_years: profile?.experience_years || 0,
    skills: profile?.skills || [],
    resume_url: profile?.resume_url || '',
    portfolio_url: profile?.portfolio_url || '',
    actively_looking_for_work: profile?.actively_looking_for_work || false,
    avatar_url: profile?.avatar_url || ''
  });
  const [newSkill, setNewSkill] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...formData.skills, newSkill.trim()];
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
      setNewSkill('');
      
      // Show success message
      toast({
        title: "Skill Added",
        description: `"${newSkill.trim()}" has been added to your skills.`,
      });
    } else if (formData.skills.includes(newSkill.trim())) {
      toast({
        title: "Skill Already Exists",
        description: "This skill is already in your list.",
        variant: "destructive"
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    
    toast({
      title: "Skill Removed",
      description: `"${skillToRemove}" has been removed from your skills.`,
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Create bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true
      });

      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      handleInputChange('avatar_url', data.publicUrl);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.full_name.trim()) {
      errors.push("Full name is required");
    }
    
    if (formData.website && !formData.website.startsWith('http')) {
      errors.push("Website URL must start with http:// or https://");
    }
    
    if (formData.linkedin_url && !formData.linkedin_url.includes('linkedin.com')) {
      errors.push("LinkedIn URL must be a valid LinkedIn profile");
    }
    
    if (formData.experience_years < 0) {
      errors.push("Experience years cannot be negative");
    }

    return errors;
  };

  const handleSave = async () => {
    if (!user) return;
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(", "),
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated and saved.",
      });
      
      onSave();
    } catch (error: any) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Your Profile
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-gray-200">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                  {formData.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Work Status Toggle */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div>
              <Label className="text-lg font-semibold text-green-800">Actively Looking for Work</Label>
              <p className="text-sm text-green-600 mt-1">Show potential employers you're open to opportunities</p>
            </div>
            <Switch
              checked={formData.actively_looking_for_work}
              onCheckedChange={(checked) => handleInputChange('actively_looking_for_work', checked)}
              className="scale-125"
            />
          </div>

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Your full name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself, your passions, and what makes you unique..."
                rows={4}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="current_position" className="text-sm font-medium">Current Position</Label>
                <Input
                  id="current_position"
                  value={formData.current_position}
                  onChange={(e) => handleInputChange('current_position', e.target.value)}
                  placeholder="e.g. Senior Developer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company_name" className="text-sm font-medium">Company</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Your company name"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g. Technology, Finance"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="experience_years" className="text-sm font-medium">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="education" className="text-sm font-medium">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Your educational background"
                className="mt-1"
              />
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Skills & Expertise</h3>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. JavaScript, Project Management)"
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addSkill}
                disabled={!newSkill.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-gray-200 rounded-lg">
              {formData.skills.length === 0 ? (
                <p className="text-gray-500 text-sm">No skills added yet. Add some skills to showcase your expertise!</p>
              ) : (
                formData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                    {skill}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Resume & Portfolio */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Resume & Portfolio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="resume_url" className="text-sm font-medium">Resume URL</Label>
                <Input
                  id="resume_url"
                  value={formData.resume_url}
                  onChange={(e) => handleInputChange('resume_url', e.target.value)}
                  placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="portfolio_url" className="text-sm font-medium">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  placeholder="Link to your portfolio website"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-green-500" />
              Social Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="linkedin_url" className="text-sm font-medium">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter_url" className="text-sm font-medium">Twitter</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url}
                  onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                  placeholder="https://twitter.com/yourusername"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="github_url" className="text-sm font-medium">GitHub</Label>
                <Input
                  id="github_url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Save Section */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel Changes
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditor;
